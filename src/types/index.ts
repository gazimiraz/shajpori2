export type ProductCategory = 'Dress' | 'Bag' | 'Accessory' | 'Jewelry' | 'Footwear'
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded'
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded' | 'Partially_Refunded'
export type StockMovementType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage'
export type FinanceEntryType = 'revenue' | 'expense' | 'refund' | 'adjustment'

export interface User { id:string; email:string; full_name?:string; phone?:string; role:'customer'|'admin'|'staff'; shipping_address?:Address; total_orders:number; total_spent:number; loyalty_points:number; created_at:string }
export interface Address { name?:string; street:string; city:string; district:string; postal_code:string }
export interface Product { id:string; sku:string; name:string; slug:string; description?:string; short_description?:string; category:ProductCategory; price:number; compare_at_price?:number; cost_price?:number; colors:string[]; available_sizes:string[]; materials:string[]; tags:string[]; image_urls:string[]; thumbnail_url?:string; track_inventory?:boolean; total_stock:number; reserved_stock:number; low_stock_alert:number; badge?:string; is_active:boolean; is_featured:boolean; total_sold:number; total_revenue:number; view_count:number; rating_avg:number; rating_count:number; created_at:string; updated_at:string; variants?:ProductVariant[] }
export interface ProductVariant { id:string; product_id:string; sku:string; size?:string; color?:string; color_hex?:string; stock_quantity:number; reserved_qty:number; price_modifier:number; is_active:boolean }
export interface OrderItem { product_id:string; variant_id?:string; name:string; size?:string; color?:string; qty:number; unit_price:number; total_price:number }
export interface Order { order_id:string; order_number:string; user_id?:string; items_ordered:OrderItem[]; subtotal:number; delivery_charge:number; discount_amount:number; total_amount:number; payment_status:PaymentStatus; payment_method?:string; stripe_session_id?:string; status:OrderStatus; shipping_address:Address; created_at:string; updated_at:string }
export interface CartItem { key:string; product_id:string; variant_id?:string; name:string; slug:string; size:string; color?:string; image_url?:string; price:number; qty:number }
export interface FinanceLedgerEntry { id:string; entry_type:FinanceEntryType; category:string; description:string; amount:number; entry_date:string; created_at:string }
export interface StockMovement { id:string; product_id:string; variant_id?:string; movement_type:StockMovementType; quantity:number; quantity_before:number; quantity_after:number; reference_id?:string; notes?:string; created_at:string }
