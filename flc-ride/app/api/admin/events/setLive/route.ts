import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
    try{
        const { id, status} = await req.json()
    
        await db.query(
            "UPDATE events SET Status = ? WHERE EventID = ?",
            [status, id]
        )
        return NextResponse.json({success: true})
    } catch (err){
        console.error("Set live error:", err)
        return NextResponse.json({error: "Server error"}, {status: 500})
    }
}
