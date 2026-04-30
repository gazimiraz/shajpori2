import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'dashboard'
  const from = searchParams.get('from') || new Date(Date.now() - 30*86400000).toISOString().split('T')[0]
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

  switch(type) {
    case 'dashboard': {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
      const monthStartStr = monthStart.toISOString().split('T')[0]
      const todayStr = new Date().toISOString().split('T')[0]

      const [{data:financeData},{data:ordersData},{data:stockData},{data:topProducts}] = await Promise.all([
        supabaseAdmin.from('finance_ledger').select('entry_type,amount').gte('entry_date',monthStartStr).lte('entry_date',todayStr),
        supabaseAdmin.from('orders').select('status'),
        supabaseAdmin.from('v_stock_alerts').select('variant_id',{count:'exact',head:true}),
        supabaseAdmin.from('v_product_performance').select('name,total_sold,total_revenue,category').order('total_revenue',{ascending:false}).limit(5),
      ])

      const revenue = (financeData||[]).filter(e=>e.entry_type==='revenue').reduce((s,e)=>s+e.amount,0)
      const expenses = (financeData||[]).filter(e=>e.entry_type==='expense').reduce((s,e)=>s+e.amount,0)
      const orders_by_status = (ordersData||[]).reduce((acc:Record<string,number>,o)=>{ acc[o.status]=(acc[o.status]||0)+1; return acc },{})

      return NextResponse.json({ data: {
        revenue, expenses, net_profit: revenue - expenses,
        orders_total: (ordersData||[]).length,
        orders_by_status,
        low_stock_count: stockData?.length ?? 0,
        top_products: topProducts || [],
      }})
    }
    case 'daily_sales': { const {data,error}=await supabaseAdmin.from('v_daily_sales').select('*').gte('sale_date',from).lte('sale_date',to); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({data}) }
    case 'product_performance': { const {data,error}=await supabaseAdmin.from('v_product_performance').select('*').order('total_revenue',{ascending:false}); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({data}) }
    case 'size_wise': { const {data,error}=await supabaseAdmin.from('v_size_wise_sales').select('*'); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({data}) }
    case 'color_wise': { const {data,error}=await supabaseAdmin.from('v_color_wise_sales').select('*'); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({data}) }
    case 'stock_alerts': { const {data,error}=await supabaseAdmin.from('v_stock_alerts').select('*'); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({data}) }
    case 'monthly_finance': { const {data,error}=await supabaseAdmin.from('v_monthly_finance').select('*').limit(12); if(error)return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({data}) }
    default: return NextResponse.json({error:'Unknown type'},{status:400})
  }
}
