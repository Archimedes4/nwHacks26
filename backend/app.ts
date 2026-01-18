import express from 'express';
import {createClient} from '@supabase/supabase-js'
import {z} from "zod";
import dotenv from 'dotenv';
import { randomUUID } from "crypto";
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
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.uid)
    .single()
})


app.get('/insights', authMiddleware, (req, res) => {
  res.send("ok")
})


export const healthDataSchema = z.object({
  gender: z.enum(["Male", "Female"]).optional(),

  age: z.number().int().min(1).max(100).optional(),

  height: z.number().positive().optional(),  // cm
  weight: z.number().positive().optional(),  // kg

  sleepDuration: z.number().positive(),      // hours
  physicalActivity: z.number().int().min(0), // minutes

  restingHeartrate: z.number().int().min(50).max(200).nullable(),
  dailySteps: z.number().int().min(0).nullable(),
  stressLevel: z.number().int().min(1).max(10).nullable(),
});
app.post("/insights", authMiddleware, async (req, res) => {
  const result = healthDataSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }



  // Call model service

  // Get the user from the server
  if (result.data.gender === undefined || result.data.age === undefined || result.data.)

  const { error } = await supabase
  .from("insights")
  .insert({
    id: randomUUID(),
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
