import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role = "passenger",
      phonenumber,
      carModel,
      licensePlate,
      address,
    } = await req.json()

    if (!firstname || !lastname || !email || !password || !address) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    if (role !== "driver" && role !== "passenger") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (role === "driver" && (!carModel || !licensePlate)) {
      return NextResponse.json(
        { error: "Driver registration requires car model and license plate" },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)

    const fields = ["Email", "Password", "Role", "FirstName", "LastName", "Address"]
    const values = [email, hashed, role, firstname, lastname, address]

    if (phonenumber) {
      fields.push("PhoneNumber")
      values.push(phonenumber)
    }

    if (role === "driver") {
      if (licensePlate) {
        fields.push("LicensePlate")
        values.push(licensePlate)
      }
      if (carModel) {
        fields.push("CarModel")
        values.push(carModel)
      }
    }

    const query = `INSERT INTO users (${fields.join(", ")}) VALUES (${fields
      .map(() => "?")
      .join(", ")})`

    await db.query(query, values)

    return NextResponse.json({
      success: true,
      user: {
        firstname,
        lastname,
        email,
        role,
        phonenumber,
        carModel: role === "driver" ? carModel : undefined,
        licensePlate: role === "driver" ? licensePlate : undefined,
        address,
      },
    })
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

