import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
    try{
        const { eventID, name, date, time, location } = await req.json()
    
        await db.query(
            "UPDATE events SET Name = ?, Date = ?, Time = ?, Location = ? WHERE EventID = ?",
            [name, date, time, location, eventID]
        )
        return NextResponse.json({success: true})
    } catch (err){
        console.error("Edit event error:", err)
        return NextResponse.json({error: "Server error"}, {status: 500})
    }


}
