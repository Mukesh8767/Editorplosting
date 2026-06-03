import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-client";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const featured = request.nextUrl.searchParams.get("featured");
  const id = request.nextUrl.searchParams.get("id");

  const supabaseAdmin = getSupabaseAdmin();
  let baseQuery = supabaseAdmin.from("events").select("*, event_images(*)").order("start_date", { ascending: true });

  if (id) {
    const { data, error } = await baseQuery.eq("id", id).single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  if (userId) {
    baseQuery = baseQuery.eq("created_by", userId);
  }

  if (featured === "true") {
    baseQuery = baseQuery.eq("is_featured", true);
  }

  const { data, error } = await baseQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const payload = await request.json();

  const {
    id,
    title,
    description,
    event_type,
    start_date,
    end_date,
    location,
    organizer,
    registration_url,
    cover_image_url,
    is_featured,
    created_by,
    event_images, // Array of { image_url, display_order }
  } = payload;

  if (!title || !start_date) {
    return NextResponse.json({ error: "Missing required event fields: title and start_date." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const values: any = {
    title,
    description: description ?? null,
    event_type: event_type ?? null,
    start_date,
    end_date: end_date ?? null,
    location: location ?? null,
    organizer: organizer ?? null,
    registration_url: registration_url ?? null,
    cover_image_url: cover_image_url ?? null,
    is_featured: is_featured ?? false,
    created_by: created_by ?? null,
    updated_at: now,
  };

  const manageEventImages = async (eventId: string) => {
    // Delete existing images for this event
    const { error: deleteError } = await supabaseAdmin.from("event_images").delete().eq("event_id", eventId);
    if (deleteError) throw deleteError;

    // Insert new images
    if (Array.isArray(event_images) && event_images.length > 0) {
      const imageRows = event_images.map((img: any, idx: number) => ({
        event_id: eventId,
        image_url: img.image_url,
        display_order: img.display_order ?? idx,
      }));
      const { error: insertError } = await supabaseAdmin.from("event_images").insert(imageRows);
      if (insertError) throw insertError;
    }
  };

  if (id) {
    const { error: updateError } = await supabaseAdmin.from("events").update(values).eq("id", id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    try {
      await manageEventImages(id);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to save event gallery." }, { status: 500 });
    }

    const { data: refreshedEvent, error: refreshedError } = await supabaseAdmin
      .from("events")
      .select("*, event_images(*)")
      .eq("id", id)
      .single();

    if (refreshedError) {
      return NextResponse.json({ error: refreshedError.message }, { status: 500 });
    }

    revalidatePath("/events");
    return NextResponse.json(refreshedEvent);
  }

  values.created_at = now;
  const { data: insertData, error: insertError } = await supabaseAdmin.from("events").insert([values]).select("id");
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const newEventId = insertData?.[0]?.id;
  if (!newEventId) {
    return NextResponse.json({ error: "Failed to retrieve new event ID." }, { status: 500 });
  }

  try {
    await manageEventImages(newEventId);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save event gallery." }, { status: 500 });
  }

  const { data: refreshedEvent, error: refreshedError } = await supabaseAdmin
      .from("events")
      .select("*, event_images(*)")
      .eq("id", newEventId)
      .single();

  if (refreshedError) {
    return NextResponse.json({ error: refreshedError.message }, { status: 500 });
  }

  revalidatePath("/events");
  return NextResponse.json(refreshedEvent);
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }

  // event_images has cascading delete, but let's delete explicitly to be safe
  await supabaseAdmin.from("event_images").delete().eq("event_id", id);

  const { error } = await supabaseAdmin.from("events").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/events");
  return NextResponse.json({ success: true });
}
