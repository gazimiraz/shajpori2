import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'ledger'
  const from = searchParams.get('from') || new Date(Date.now()-30*86400000).toISOString().split('T')[0]
  const to = searchParams.get('to') || new Date().toISOString().split('T')[0]

  if(type==='ledger') {
    const {data,error,count}=await supabaseAdmin.from('finance_ledger').select('*',{count:'exact'}).gte('entry_date',from).lte('entry_date',to).order('entry_date',{ascending:false})
    if(error)return NextResponse.json({error:error.message},{status:500})
    return NextResponse.json({data,count})
  }
  if(type==='monthly') {
    const {data,error}=await supabaseAdmin.from('v_monthly_finance').select('*').limit(12)
    if(error)return NextResponse.json({error:error.message},{status:500})
    return NextResponse.json({data})
  }
  if(type==='pnl') {
    const {data,error}=await supabaseAdmin.from('finance_ledger').select('entry_type,category,amount').gte('entry_date',from).lte('entry_date',to)
    if(error)return NextResponse.json({error:error.message},{status:500})
    const entries=data||[]
    const revenue=entries.filter(e=>e.entry_type==='revenue').reduce((s,e)=>s+e.amount,0)
    const expenses=entries.filter(e=>e.entry_type==='expense').reduce((s,e)=>s+e.amount,0)
    const refunds=entries.filter(e=>e.entry_type==='refund').reduce((s,e)=>s+e.amount,0)
    return NextResponse.json({data:{revenue,expenses,refunds,net_profit:revenue-expenses-refunds,margin:revenue>0?Math.round((revenue-expenses-refunds)/revenue*10000)/100:0}})
  }
  return NextResponse.json({error:'Unknown type'},{status:400})
}

export async function POST(req: NextRequest) {
  const {entry_type,category,description,amount,payment_method,entry_date}=await req.json()
  const {data,error}=await supabaseAdmin.from('finance_ledger').insert({entry_type,category,description,amount,payment_method,entry_date:entry_date||new Date().toISOString().split('T')[0],reference_type:'manual'}).select().single()
  if(error)return NextResponse.json({error:error.message},{status:400})
  return NextResponse.json({data},{status:201})
}
