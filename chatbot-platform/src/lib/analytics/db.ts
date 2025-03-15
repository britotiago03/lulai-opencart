/* src/lib/analytics/db.ts */
import { query } from '@/lib/db/client';
import {
    ChatbotAnalytics,
    ConversationSummary,
    FeedbackSummary,
    DailyMetric,
    ConversationDetail
} from './types';

interface ConversationData {
    chatbotId: string;
    sessionId: string;
    visitorId?: string;
    sourceUrl?: string;
    platform?: string;
}

interface MessageData {
    conversationId: string;
    isFromUser: boolean;
    messageText: string;
    responseId: string | null;
    isAiGenerated: boolean;
    matchedTriggers: string[] | null;
    confidenceScore: number | null;
}

/**
 * Get analytics data for a specific chatbot within a date range
 */
export async function getChatbotAnalytics(
    chatbotId: string,
    startDate: string,
    endDate: string
): Promise<ChatbotAnalytics> {
    // For basic metrics that don't need complex calculations
    const overallResult = await query<{
        total_conversations: number;
        total_messages: number;
        unique_visitors: number;
        successful_matches: number;
        ai_fallbacks: number;
        avg_feedback_score: number;
        conversion_count: number;
        conversion_rate: number;
        total_conversion_value: number;
    }>(
        `SELECT
             COUNT(DISTINCT c.id) as total_conversations,
             COUNT(cm.id) as total_messages,
             COUNT(DISTINCT c.visitor_id) as unique_visitors,
             SUM(CASE WHEN cm.response_id IS NOT NULL THEN 1 ELSE 0 END) as successful_matches,
             SUM(CASE WHEN cm.is_ai_generated = true THEN 1 ELSE 0 END) as ai_fallbacks,
             AVG(f.rating) as avg_feedback_score,
             COUNT(DISTINCT CASE WHEN c.led_to_conversion = true THEN c.id ELSE NULL END) as conversion_count,
             (COUNT(DISTINCT CASE WHEN c.led_to_conversion = true THEN c.id ELSE NULL END)::float / 
       NULLIF(COUNT(DISTINCT c.id), 0)::float) * 100 as conversion_rate,
             SUM(c.conversion_value) as total_conversion_value
         FROM conversations c
                  LEFT JOIN conversation_messages cm ON c.id = cm.conversation_id AND cm.is_from_user = false
                  LEFT JOIN chatbot_feedback f ON cm.id = f.message_id
         WHERE c.chatbot_id = $1
           AND c.started_at >= $2::date
      AND c.started_at < ($3::date + interval '1 day')
        `,
        [chatbotId, startDate, endDate]
    );

    // Get average conversation length in a separate query
    const avgConversationLengthResult = await query<{ avg_length: number }>(
        `SELECT AVG(message_count) as avg_length
         FROM (
                  SELECT conversation_id, COUNT(*) as message_count
                  FROM conversation_messages
                  WHERE conversation_id IN (
                      SELECT id FROM conversations
                      WHERE chatbot_id = $1
                        AND started_at >= $2::date
                    AND started_at < ($3::date + interval '1 day')
              )
         GROUP BY conversation_id
             ) as conversation_lengths`,
        [chatbotId, startDate, endDate]
    );

    // Get average response time in a separate query
    const avgResponseTimeResult = await query<{ avg_time: number }>(
        `SELECT AVG(response_time) as avg_time
         FROM (
                  SELECT
                      m1.conversation_id,
                      m1.id as user_message_id,
                      m2.id as bot_message_id,
                      EXTRACT(EPOCH FROM (m2.sent_at - m1.sent_at)) as response_time
                  FROM conversation_messages m1
                           JOIN conversation_messages m2 ON
                      m1.conversation_id = m2.conversation_id AND
                      m1.is_from_user = true AND
                      m2.is_from_user = false AND
                      m2.sent_at > m1.sent_at
                  WHERE m1.conversation_id IN (
                      SELECT id FROM conversations
                      WHERE chatbot_id = $1
                        AND started_at >= $2::date
                    AND started_at < ($3::date + interval '1 day')
              )
             AND NOT EXISTS (
         SELECT 1 FROM conversation_messages m3
         WHERE m3.conversation_id = m1.conversation_id
           AND m3.sent_at > m1.sent_at
           AND m3.sent_at < m2.sent_at
       )
     ) as response_times`,
        [chatbotId, startDate, endDate]
    );

    // Get daily metrics
    const dailyResult = await query<{
        date: string;
        conversation_count: number;
        message_count: number;
        conversion_count: number;
        conversion_rate: number;
    }>(
        `SELECT
      DATE(c.started_at) as date,
      COUNT(DISTINCT c.id) as conversation_count,
      COUNT(cm.id) as message_count,
      COUNT(DISTINCT CASE WHEN c.led_to_conversion = true THEN c.id ELSE NULL END) as conversion_count,
      (COUNT(DISTINCT CASE WHEN c.led_to_conversion = true THEN c.id ELSE NULL END)::float / 
       NULLIF(COUNT(DISTINCT c.id), 0)::float) * 100 as conversion_rate
    FROM conversations c
    LEFT JOIN conversation_messages cm ON c.id = cm.conversation_id
    WHERE c.chatbot_id = $1
      AND c.started_at >= $2::date
      AND c.started_at < ($3::date + interval '1 day')
    GROUP BY DATE(c.started_at)
    ORDER BY date ASC
    `,
        [chatbotId, startDate, endDate]
    );

    // Get popular topics
    const topicsResult = await query<{
        trigger: string;
        count: number;
    }>(
        `SELECT
      unnest(cm.matched_triggers) as trigger,
      COUNT(*) as count
    FROM conversation_messages cm
    JOIN conversations c ON c.id = cm.conversation_id
    WHERE c.chatbot_id = $1
      AND c.started_at >= $2::date
      AND c.started_at < ($3::date + interval '1 day')
      AND cm.matched_triggers IS NOT NULL
    GROUP BY trigger
    ORDER BY count DESC
    LIMIT 10
    `,
        [chatbotId, startDate, endDate]
    );

    // Format the daily metrics for easier charting
    const dailyMetrics: DailyMetric[] = dailyResult.rows.map(row => ({
        date: row.date,
        conversationCount: row.conversation_count,
        messageCount: row.message_count,
        conversionCount: row.conversion_count,
        conversionRate: row.conversion_rate
    }));

    // Return the formatted analytics data with all metrics
    return {
        overview: {
            totalConversations: overallResult.rows[0]?.total_conversations || 0,
            totalMessages: overallResult.rows[0]?.total_messages || 0,
            uniqueVisitors: overallResult.rows[0]?.unique_visitors || 0,
            avgConversationLength: Number(avgConversationLengthResult.rows[0]?.avg_length) || 0,
            avgResponseTime: Number(avgResponseTimeResult.rows[0]?.avg_time) || 0,
            successfulMatches: overallResult.rows[0]?.successful_matches || 0,
            aiFallbacks: overallResult.rows[0]?.ai_fallbacks || 0,
            avgFeedbackScore: Number(overallResult.rows[0]?.avg_feedback_score) || 0,
            conversionCount: overallResult.rows[0]?.conversion_count || 0,
            conversionRate: Number(overallResult.rows[0]?.conversion_rate) || 0,
            totalConversionValue: Number(overallResult.rows[0]?.total_conversion_value) || 0
        },
        dailyMetrics,
        popularTopics: topicsResult.rows.map(row => ({
            trigger: row.trigger,
            count: row.count
        }))
    };
}

/**
 * Log a conversation or get existing conversation ID
 */
export async function logConversation(data: ConversationData): Promise<string> {
    // Check if conversation with this session ID already exists
    const existingResult = await query<{ id: string }>(
        `SELECT id FROM conversations
     WHERE chatbot_id = $1 AND session_id = $2 AND (ended_at IS NULL OR ended_at > NOW() - INTERVAL '30 minutes')
     ORDER BY started_at DESC
     LIMIT 1`,
        [data.chatbotId, data.sessionId]
    );

    if (existingResult.rows.length > 0) {
        // Return existing conversation ID
        return existingResult.rows[0].id;
    }

    // Create a new conversation
    const result = await query<{ id: string }>(
        `INSERT INTO conversations (
      chatbot_id, session_id, visitor_id, source_url, platform
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING id`,
        [
            data.chatbotId,
            data.sessionId,
            data.visitorId || null,
            data.sourceUrl || null,
            data.platform || null
        ]
    );

    return result.rows[0].id;
}

/**
 * Log a message in a conversation
 */
export async function logMessage(data: MessageData): Promise<string> {
    const result = await query<{ id: string }>(
        `INSERT INTO conversation_messages (
      conversation_id, is_from_user, message_text, response_id, is_ai_generated, matched_triggers, confidence_score
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
        [
            data.conversationId,
            data.isFromUser,
            data.messageText,
            data.responseId,
            data.isAiGenerated,
            data.matchedTriggers,
            data.confidenceScore
        ]
    );

    // Update the conversation's ended_at timestamp
    await query(
        `UPDATE conversations
     SET ended_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
        [data.conversationId]
    );

    return result.rows[0].id;
}

/**
 * Log feedback for a chatbot response
 */
export async function logFeedback(
    messageId: string,
    rating: number,
    feedbackText?: string
): Promise<string> {
    const result = await query<{ id: string }>(
        `INSERT INTO chatbot_feedback (
      message_id, rating, feedback_text
    ) VALUES ($1, $2, $3)
    RETURNING id`,
        [
            messageId,
            rating,
            feedbackText || null
        ]
    );

    return result.rows[0].id;
}

/**
 * Record a conversion related to a conversation
 */
export async function recordConversion(
    conversationId: string,
    conversionValue?: number
): Promise<void> {
    await query(
        `UPDATE conversations
     SET led_to_conversion = true,
         conversion_value = $2,
         conversion_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
        [conversationId, conversionValue || null]
    );
}

/**
 * Update analytics table with aggregated data (scheduled job)
 * This function should be called by a scheduled job to update the analytics table
 */
export async function aggregateDailyAnalytics(date: string): Promise<void> {
    // Get all chatbots
    const chatbotsResult = await query<{ id: string }>(
        `SELECT id FROM chatbots`
    );

    // For each chatbot, aggregate analytics
    for (const chatbot of chatbotsResult.rows) {
        // Check if we already have analytics for this date and chatbot
        const existingResult = await query(
            `SELECT id FROM chatbot_analytics
       WHERE chatbot_id = $1 AND date = $2::date`,
            [chatbot.id, date]
        );

        const exists = existingResult.rows.length > 0;

        // Calculate metrics
        const metricsResult = await query<{
            conversation_count: number;
            message_count: number;
            unique_visitors: number;
            average_conversation_length: number;
            average_response_time: number;
            successful_matches: number;
            ai_fallbacks: number;
            average_feedback_score: number;
            conversion_count: number;
            conversion_rate: number;
            total_conversion_value: number;
        }>(
            `SELECT
        COUNT(DISTINCT c.id) as conversation_count,
        COUNT(cm.id) as message_count,
        COUNT(DISTINCT c.visitor_id) as unique_visitors,
        AVG((SELECT COUNT(*) FROM conversation_messages WHERE conversation_id = c.id)) as average_conversation_length,
        AVG(EXTRACT(EPOCH FROM (cm.sent_at - lag(cm.sent_at) OVER (PARTITION BY c.id ORDER BY cm.sent_at)))) as average_response_time,
        SUM(CASE WHEN cm.response_id IS NOT NULL THEN 1 ELSE 0 END) as successful_matches,
        SUM(CASE WHEN cm.is_ai_generated = true THEN 1 ELSE 0 END) as ai_fallbacks,
        COALESCE(AVG(f.rating), 0) as average_feedback_score,
        COUNT(DISTINCT CASE WHEN c.led_to_conversion = true THEN c.id ELSE NULL END) as conversion_count,
        CASE 
          WHEN COUNT(DISTINCT c.id) = 0 THEN 0
          ELSE (COUNT(DISTINCT CASE WHEN c.led_to_conversion = true THEN c.id ELSE NULL END) * 100.0 / COUNT(DISTINCT c.id))
        END as conversion_rate,
        COALESCE(SUM(c.conversion_value), 0) as total_conversion_value
      FROM conversations c
      LEFT JOIN conversation_messages cm ON c.id = cm.conversation_id
      LEFT JOIN chatbot_feedback f ON cm.id = f.message_id
      WHERE c.chatbot_id = $1
        AND DATE(c.started_at) = $2::date`,
            [chatbot.id, date]
        );

        const metrics = metricsResult.rows[0];

        if (exists) {
            // Update existing record
            await query(
                `UPDATE chatbot_analytics
         SET 
           conversation_count = $3,
           message_count = $4,
           unique_visitors = $5,
           average_conversation_length = $6,
           average_response_time = $7,
           successful_matches = $8,
           ai_fallbacks = $9,
           average_feedback_score = $10,
           conversion_count = $11,
           conversion_rate = $12,
           total_conversion_value = $13
         WHERE chatbot_id = $1 AND date = $2::date`,
                [
                    chatbot.id,
                    date,
                    metrics.conversation_count,
                    metrics.message_count,
                    metrics.unique_visitors,
                    metrics.average_conversation_length,
                    metrics.average_response_time,
                    metrics.successful_matches,
                    metrics.ai_fallbacks,
                    metrics.average_feedback_score,
                    metrics.conversion_count,
                    metrics.conversion_rate,
                    metrics.total_conversion_value
                ]
            );
        } else {
            // Insert new record
            await query(
                `INSERT INTO chatbot_analytics (
           chatbot_id, date, conversation_count, message_count, unique_visitors,
           average_conversation_length, average_response_time, successful_matches,
           ai_fallbacks, average_feedback_score, conversion_count, conversion_rate, total_conversion_value
         ) VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    chatbot.id,
                    date,
                    metrics.conversation_count,
                    metrics.message_count,
                    metrics.unique_visitors,
                    metrics.average_conversation_length || 0,
                    metrics.average_response_time || 0,
                    metrics.successful_matches || 0,
                    metrics.ai_fallbacks || 0,
                    metrics.average_feedback_score || 0,
                    metrics.conversion_count || 0,
                    metrics.conversion_rate || 0,
                    metrics.total_conversion_value || 0
                ]
            );
        }
    }
}

/**
 * Get recent conversations for a chatbot
 */
export async function getChatbotConversations(
    chatbotId: string,
    startDate: string,
    endDate: string,
    limit: number = 10,
    offset: number = 0
): Promise<{ conversations: ConversationSummary[], total: number }> {
    // Get total count
    const countResult = await query<{ total: number }>(
        `SELECT COUNT(*) as total
     FROM conversations
     WHERE chatbot_id = $1
       AND started_at >= $2::date
       AND started_at < ($3::date + interval '1 day')
    `,
        [chatbotId, startDate, endDate]
    );

    // Get conversations with message count and first/last message
    const conversationsResult = await query<{
        id: string;
        session_id: string;
        started_at: string;
        ended_at: string | null;
        source_url: string | null;
        message_count: number;
        first_message: string;
        last_message: string;
        led_to_conversion: boolean;
        conversion_value: number | null;
    }>(
        `SELECT
      c.id,
      c.session_id,
      c.started_at,
      c.ended_at,
      c.source_url,
      COUNT(cm.id) as message_count,
      (SELECT message_text FROM conversation_messages 
        WHERE conversation_id = c.id AND is_from_user = true 
        ORDER BY sent_at ASC LIMIT 1) as first_message,
      (SELECT message_text FROM conversation_messages 
        WHERE conversation_id = c.id
        ORDER BY sent_at DESC LIMIT 1) as last_message,
      c.led_to_conversion,
      c.conversion_value
    FROM conversations c
    LEFT JOIN conversation_messages cm ON c.id = cm.conversation_id
    WHERE c.chatbot_id = $1
      AND c.started_at >= $2::date
      AND c.started_at < ($3::date + interval '1 day')
    GROUP BY c.id
    ORDER BY c.started_at DESC
    LIMIT $4 OFFSET $5
    `,
        [chatbotId, startDate, endDate, limit, offset]
    );

    return {
        conversations: conversationsResult.rows.map(row => ({
            id: row.id,
            sessionId: row.session_id,
            startedAt: new Date(row.started_at),
            endedAt: row.ended_at ? new Date(row.ended_at) : null,
            sourceUrl: row.source_url,
            messageCount: row.message_count,
            firstMessage: row.first_message,
            lastMessage: row.last_message,
            ledToConversion: row.led_to_conversion,
            conversionValue: row.conversion_value
        })),
        total: countResult.rows[0]?.total || 0
    };
}

/**
 * Get feedback summary for a chatbot
 */
export async function getChatbotFeedback(
    chatbotId: string,
    startDate: string,
    endDate: string
): Promise<FeedbackSummary> {
    // Get overall feedback stats
    const overallResult = await query<{
        total_feedback: number;
        avg_rating: number;
        rating_distribution: string;
    }>(
        `SELECT
      COUNT(*) as total_feedback,
      AVG(f.rating) as avg_rating,
      jsonb_object_agg(f.rating::text, count) as rating_distribution
    FROM (
      SELECT rating, COUNT(*) as count
      FROM chatbot_feedback f
      JOIN conversation_messages cm ON f.message_id = cm.id
      JOIN conversations c ON cm.conversation_id = c.id
      WHERE c.chatbot_id = $1
        AND f.submitted_at >= $2::date
        AND f.submitted_at < ($3::date + interval '1 day')
      GROUP BY rating
    ) f
    `,
        [chatbotId, startDate, endDate]
    );

    // Get recent feedback with context
    const recentFeedbackResult = await query<{
        id: string;
        message_id: string;
        rating: number;
        feedback_text: string | null;
        submitted_at: string;
        message_text: string;
        response_text: string;
    }>(
        `SELECT
      f.id,
      f.message_id,
      f.rating,
      f.feedback_text,
      f.submitted_at,
      user_msg.message_text as message_text,
      cm.message_text as response_text
    FROM chatbot_feedback f
    JOIN conversation_messages cm ON f.message_id = cm.id
    JOIN conversations c ON cm.conversation_id = c.id
    LEFT JOIN conversation_messages user_msg ON (
      user_msg.conversation_id = cm.conversation_id AND
      user_msg.is_from_user = true AND
      user_msg.sent_at < cm.sent_at
    )
    WHERE c.chatbot_id = $1
      AND f.submitted_at >= $2::date
      AND f.submitted_at < ($3::date + interval '1 day')
    ORDER BY f.submitted_at DESC
    LIMIT 10
    `,
        [chatbotId, startDate, endDate]
    );

    // Parse the rating distribution or provide default
    let ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    if (overallResult.rows[0]?.rating_distribution) {
        try {
            ratingDistribution = {
                ...ratingDistribution,
                ...JSON.parse(overallResult.rows[0].rating_distribution)
            };
        } catch (e) {
            console.error('Error parsing rating distribution:', e);
        }
    }

    return {
        totalFeedback: overallResult.rows[0]?.total_feedback || 0,
        averageRating: overallResult.rows[0]?.avg_rating || 0,
        ratingDistribution,
        recentFeedback: recentFeedbackResult.rows.map(row => ({
            id: row.id,
            messageId: row.message_id,
            rating: row.rating,
            feedbackText: row.feedback_text,
            submittedAt: new Date(row.submitted_at),
            messageText: row.message_text,
            responseText: row.response_text
        }))
    };
}

/**
 * Get detailed information about a specific conversation including all messages
 */
export async function getConversationDetail(conversationId: string): Promise<ConversationDetail | null> {
    // Get conversation info
    const conversationResult = await query<{
        id: string;
        chatbot_id: string;
        session_id: string;
        started_at: string;
        ended_at: string | null;
        source_url: string | null;
        visitor_id: string | null;
        platform: string | null;
        led_to_conversion: boolean;
        conversion_value: number | null;
        conversion_at: string | null;
    }>(
        `SELECT 
      id, chatbot_id, session_id, started_at, ended_at, source_url, 
      visitor_id, platform, led_to_conversion, conversion_value, conversion_at
     FROM conversations
     WHERE id = $1`,
        [conversationId]
    );

    if (conversationResult.rows.length === 0) {
        return null;
    }

    const conversation = conversationResult.rows[0];

    // Get messages
    const messagesResult = await query<{
        id: string;
        is_from_user: boolean;
        message_text: string;
        is_ai_generated: boolean;
        matched_triggers: string[] | null;
        confidence_score: number | null;
        sent_at: string;
    }>(
        `SELECT 
      id, is_from_user, message_text, is_ai_generated, 
      matched_triggers, confidence_score, sent_at
     FROM conversation_messages
     WHERE conversation_id = $1
     ORDER BY sent_at ASC`,
        [conversationId]
    );

    // Get feedback
    const feedbackResult = await query<{
        id: string;
        message_id: string;
        rating: number;
        feedback_text: string | null;
        submitted_at: string;
    }>(
        `SELECT 
      id, message_id, rating, feedback_text, submitted_at
     FROM chatbot_feedback
     WHERE message_id IN (
       SELECT id FROM conversation_messages WHERE conversation_id = $1
     )
     ORDER BY submitted_at DESC`,
        [conversationId]
    );

    const messageCount = messagesResult.rows.length;
    const firstMessage = messagesResult.rows.length > 0
        ? messagesResult.rows.find(m => m.is_from_user)?.message_text || ''
        : '';
    const lastMessage = messagesResult.rows.length > 0
        ? messagesResult.rows[messagesResult.rows.length - 1].message_text
        : '';

    return {
        id: conversation.id,
        chatbotId: conversation.chatbot_id,
        sessionId: conversation.session_id,
        startedAt: new Date(conversation.started_at),
        endedAt: conversation.ended_at ? new Date(conversation.ended_at) : null,
        sourceUrl: conversation.source_url,
        visitorId: conversation.visitor_id,
        platform: conversation.platform,
        messageCount,
        firstMessage,
        lastMessage,
        ledToConversion: conversation.led_to_conversion,
        conversionValue: conversation.conversion_value,
        conversionAt: conversation.conversion_at ? new Date(conversation.conversion_at) : null,
        messages: messagesResult.rows.map(row => ({
            id: row.id,
            isFromUser: row.is_from_user,
            messageText: row.message_text,
            isAiGenerated: row.is_ai_generated,
            matchedTriggers: row.matched_triggers,
            confidenceScore: row.confidence_score,
            sentAt: new Date(row.sent_at)
        })),
        feedback: feedbackResult.rows.map(row => ({
            id: row.id,
            messageId: row.message_id,
            rating: row.rating,
            feedbackText: row.feedback_text,
            submittedAt: new Date(row.submitted_at)
        }))
    };
}