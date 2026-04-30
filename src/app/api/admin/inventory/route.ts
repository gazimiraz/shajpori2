import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'variants'
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('per_page') || '30')
  const from = (page - 1) * perPage

  if(type==='variants') {
    const {data,error,count}=await supabaseAdmin.from('product_variants').select('*,product:products(name,sku,category,low_stock_alert)',{count:'exact'}).eq('is_active',true).order('stock_quantity').range(from,from+perPage-1)
    if(error)return NextResponse.json({error:error.message},{status:500})
    return NextResponse.json({data,count})
  }
  if(type==='movements') {
    const {data,error,count}=await supabaseAdmin.from('stock_movements').select('*,product:products(name,sku),variant:product_variants(size,color)',{count:'exact'}).order('created_at',{ascending:false}).range(from,from+perPage-1)
    if(error)return NextResponse.json({error:error.message},{status:500})
    return NextResponse.json({data,count})
  }
  return NextResponse.json({error:'Unknown type'},{status:400})
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if(body.action==='adjust_stock') {
    const {variant_id,product_id,quantity,notes}=body
    const {data:v}=await supabaseAdmin.from('product_variants').select('stock_quantity').eq('id',variant_id).single()
    if(!v)return NextResponse.json({error:'Variant not found'},{status:404})
    const newQty=v.stock_quantity+quantity
    if(newQty<0)return NextResponse.json({error:'Stock cannot go below 0'},{status:400})
    await supabaseAdmin.from('product_variants').update({stock_quantity:newQty}).eq('id',variant_id)
    await supabaseAdmin.from('stock_movements').insert({product_id,variant_id,movement_type:'adjustment',quantity,quantity_before:v.stock_quantity,quantity_after:newQty,notes,reference_type:'adjustment'})
    return NextResponse.json({data:{new_quantity:newQty}})
  }
  return NextResponse.json({error:'Unknown action'},{status:400})
}
