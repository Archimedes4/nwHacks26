import express from 'express';
import {createClient} from '@supabase/supabase-js'
import {z} from "zod";
import dotenv from 'dotenv';
import { randomUUID } from "crypto";
import {userType} from "../frontend/types"
dotenv.config()

const app = express()
const port = 3000

const supabaseUrl = "https://yqnwqmihdkikekkfprzu.supabase.co";
const supabaseAnonKey = "sb_secret_Yw1RFmEAI4GKjjl-tWuKWQ_9pKk2M20";
const supabaseAdminKey = process.env.ADMIN_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid auth header" });
  }

  const token = auth.split(" ")[1];

  // Verify token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // attach user to request for your handlers
  req.user = user;
  next();
}


const userSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(["Male", "Female"]),
  age: z.number().int().min(1).max(100),
  height: z.number().positive(),
  weight: z.number().positive(),
});

app.post('/users', authMiddleware, async (req, res) => {
  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { error } = await supabase
  .from("users")
  .insert({
    uid: req.user.aud,
    name: result.data.name,
    gender: result.data.gender,
    age: result.data.age,
    height: result.data.height,
    weight: result.data.weight
  })

  if (error) {
    console.error(error)
    res.send("Internal Server Error")
    res.statusCode(500);
    return;
  }

  res.send("ok");
  res.statusCode(201)
})

export const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    gender: z.enum(["Male", "Female"]).optional(),
    age: z.number().int().min(1).max(100).optional(),
    height: z.number().positive().optional(), // cm
    weight: z.number().positive().optional(), // kg
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required"
  );
app.put('/users', authMiddleware, (req, res) => {
  const result = updateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  res.send("ok");
})

app.get('/users', authMiddleware, async (req, res) => {
  const result = await getUser(req.user.aid);
  if (!result.success) {
    res.statusCode(400);
    
  }
})


app.get('/insights', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
  .from("insights")
  .select("*")
  .eq("uid", req.user.aud);  // condition
  res.send("ok")
})


export const healthDataSchema = z.object({
  gender: z.enum(["Male", "Female"]).optional(),
  age: z.number().int().min(1).max(100).optional(),
  height: z.number().positive().optional(),  // cm
  weight: z.number().positive().optional(),  // kg

  sleepDuration: z.number().positive(),      // hours
  physicalActivity: z.number().int().min(0), // minutes

  restingHeartrate: z.number().int().min(50).max(200).nullable().optional(),
  dailySteps: z.number().int().min(0).nullable().optional(),
  stressLevel: z.number().int().min(1).max(10).nullable().optional(),
});
app.post("/insights", authMiddleware, async (req, res) => {
  const result = healthDataSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  // Call model service

  // Get the user from the server
  let userInfo = null;
  if (result.data.gender === undefined || result.data.age === undefined || result.data.height === undefined || result.data.weight === undefined) {
    const userResult = await getUser(req.user.aid);
    if (!result.success) {
      res.send("User not found")
      res.statusCode(404);
      return;
    }
    userInfo = {
      gender: result.data.gender ? result.data.gender:userResult.data!.gender,
      age: result.data.age ? result.data.age:userResult.data!.age,
      height: result.data.height ? result.data.height:userResult.data!.height,
      weight: result.data.weight ? result.data.weight:userResult.data!.weight,
    }
  } else {
    userInfo = {
      gender: result.data.gender,
      age: result.data.age,
      height: result.data.height,
      weight: result.data.weight,
    }
  }

  const { error } = await supabase
  .from("insights")
  .insert({
    id: randomUUID(),
    uid: req.user.aud,
    gender: result.data.gender,
    age: result.data.age,
    height: result.data.height,
    weight: result.data.weight,
    sleepDuration: result.data.sleepDuration,
    physicalActivity: result.data.physicalActivity,
    restingHeartrate: result.data.restingHeartrate,
    dailySteps: result.data.dailySteps,
    stressLevel: result.data.stressLevel,
    date: new Date().toISOString(),
    sleepQuality: 0
  })

  if (error) {
    console.error(error)
    res.send("Internal Server Error")
    res.statusCode(500);
    return;
  }

  res.send("ok");
  res.statusCode(201)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function getUser(uid: string): Promise<{
  success: boolean;
  data: userType;
} | {
  success: boolean;
  data?: userType
}> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid)
      .single();
    if (error) {
      console.error(error)
      return {
        success: false
      }
    }
    return {
      success: true,
      data: data
    }
  } catch {
    return {
      success: false
    }
  }
}