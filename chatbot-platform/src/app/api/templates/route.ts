import { NextRequest, NextResponse } from 'next/server';
import { getTemplatesByIndustry } from '@/lib/chatbots/db';
import { industrySchema } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const industry = searchParams.get('industry') || 'general';

        // Validate industry parameter
        const result = industrySchema.safeParse(industry);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid industry', details: result.error.format() },
                { status: 400 }
            );
        }

        const templates = await getTemplatesByIndustry(result.data);
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}