export interface CartItem {
    cart_item_id: number;
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
    item_total: number;
}

export interface Cart {
    id: number;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}