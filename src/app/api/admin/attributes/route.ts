// src/app/api/admin/attributes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'all'

  switch (type) {
    case 'all': {
      // Return all attribute groups with their values
      const { data: groups, error } = await supabaseAdmin
        .from('attribute_groups')
        .select('*, values:attribute_values(id, value, hex_code, sort_order, is_active)')
        .eq('is_active', true)
        .order('sort_order')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data: groups })
    }

    case 'group': {
      const groupId = searchParams.get('id')
      const { data, error } = await supabaseAdmin
        .from('attribute_values')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('sort_order')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    case 'brands': {
      const { data, error } = await supabaseAdmin
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    case 'units': {
      const { data, error } = await supabaseAdmin
        .from('units')
        .select('*')
        .eq('is_active', true)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    case 'categories': {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data })
    }

    default:
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  switch (action) {
    case 'add_value': {
      const { group_id, value, hex_code } = body
      if (!group_id || !value) return NextResponse.json({ error: 'group_id and value required' }, { status: 400 })

      const { data, error } = await supabaseAdmin
        .from('attribute_values')
        .insert({ group_id, value: value.trim(), hex_code })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data }, { status: 201 })
    }

    case 'add_group': {
      const { name, type = 'select', is_variant = false } = body
      const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')

      const { data, error } = await supabaseAdmin
        .from('attribute_groups')
        .insert({ name, slug, type, is_variant })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data }, { status: 201 })
    }

    case 'add_brand': {
      const { name } = body
      const slug = name.toLowerCase().replace(/ /g, '-')
      const { data, error } = await supabaseAdmin
        .from('brands')
        .insert({ name, slug })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data }, { status: 201 })
    }

    case 'add_unit': {
      const { name, short_name } = body
      const { data, error } = await supabaseAdmin
        .from('units')
        .insert({ name, short_name })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data }, { status: 201 })
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const table = searchParams.get('table') // attribute_values, brands, units
  const id = searchParams.get('id')

  if (!table || !id) return NextResponse.json({ error: 'table and id required' }, { status: 400 })

  const allowed = ['attribute_values', 'attribute_groups', 'brands', 'units']
  if (!allowed.includes(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })

  // Soft delete
  const { error } = await supabaseAdmin
    .from(table)
    .update({ is_active: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: { deleted: true } })
}
