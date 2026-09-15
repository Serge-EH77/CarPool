import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST (req: Request) {
    try {
        const { eventID } = await req.json()
    
        await db.query(
            "UPDATE events SET Status= 'cancelled' WHERE EventID = ?",
            [eventID]
        )
        return NextResponse.json({success: true})
    } catch (err){
        console.error("Cancel event error:", err)
        return NextResponse.json({error: "Server error"}, {status: 500})
    }
}