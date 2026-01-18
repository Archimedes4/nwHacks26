"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthDataSchema = exports.updateUserSchema = void 0;
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = require("crypto");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 8082;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const supabaseUrl = "https://yqnwqmihdkikekkfprzu.supabase.co";
const supabaseAnonKey = "sb_secret_Yw1RFmEAI4GKjjl-tWuKWQ_9pKk2M20";
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:8081", // your frontend domain
}));
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
    console.log(user);
    next();
}
const userSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    gender: zod_1.z.enum(["Male", "Female"]),
    age: zod_1.z.number().int().min(1).max(100),
    height: zod_1.z.number().positive(),
    weight: zod_1.z.number().positive(),
});
app.post('/users', authMiddleware, async (req, res) => {
    try {
        console.log(req.body);
        const result = userSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.issues });
        }
        const { error } = await supabase
            .from("users")
            .insert({
            id: (0, crypto_1.randomUUID)(),
            uid: req.user.id,
            name: result.data.name,
            gender: result.data.gender,
            age: result.data.age,
            height: result.data.height,
            weight: result.data.weight
        });
        if (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
        return res.status(201).send("ok");
    }
    catch (e) {
        console.error(e);
        return res.status(500).send("Internal Server Error");
    }
});
exports.updateUserSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).optional(),
    gender: zod_1.z.enum(["Male", "Female"]).optional(),
    age: zod_1.z.number().int().min(1).max(100).optional(),
    height: zod_1.z.number().positive().optional(), // cm
    weight: zod_1.z.number().positive().optional(), // kg
})
    .refine((data) => Object.keys(data).length > 0, "At least one field is required");
app.put('/users', authMiddleware, async (req, res) => {
    const result = exports.updateUserSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
    }
    const { data: updatedUser, error } = await supabase
        .from("users")
        .update(result.data)
        .eq("uid", req.user.id)
        .select()
        .single();
    if (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
    if (!updatedUser) {
        return res.status(404).send("User not found");
    }
    return res.status(200).send("ok");
});
app.get('/users', authMiddleware, async (req, res) => {
    try {
        console.log('GET /users handler start');
        const result = await getUser(req.user.id);
        if (!result.success) {
            return res.status(400).send("not found");
        }
        return res.status(200).json(result.data);
    }
    catch (e) {
        console.error(e);
        return res.status(500).send("Internal Server Error");
    }
});
app.get('/insights', authMiddleware, async (req, res) => {
    try {
        const { key } = req.query;
        // Base query
        let query = supabase
            .from('insights')
            .select('*')
            .eq('uid', req.user.id)
            .order('id', { ascending: true }) // change "id" if your cursor column is different
            .limit(100);
        // If a key is provided, only fetch rows after that key (cursor-based pagination)
        if (key) {
            query = query.gt('id', key); // or .lt depending on your pagination direction
        }
        const { data, error } = await query;
        if (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
        const results = data || [];
        // lastKey is the cursor for the next page
        const lastKey = results.length > 0 ? String(results[results.length - 1].id) : null;
        return res.status(200).json({
            result: {
                results,
                lastKey,
            },
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).send('Internal Server Error');
    }
});
exports.healthDataSchema = zod_1.z.object({
    gender: zod_1.z.enum(["Male", "Female"]).optional(),
    age: zod_1.z.number().int().min(1).max(100).optional(),
    height: zod_1.z.number().positive().optional(), // cm
    weight: zod_1.z.number().positive().optional(), // kg
    sleepDuration: zod_1.z.number().positive(), // hours
    physicalActivity: zod_1.z.number().int().min(0), // minutes
    restingHeartrate: zod_1.z.number().int().min(50).max(200).nullable().optional(),
    dailySteps: zod_1.z.number().int().min(0).nullable().optional(),
    stressLevel: zod_1.z.number().int().min(1).max(10).nullable().optional(),
});
app.post("/insights", authMiddleware, async (req, res) => {
    const result = exports.healthDataSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
    }
    // Get the user from the server
    let userInfo = null;
    if (result.data.gender === undefined || result.data.age === undefined || result.data.height === undefined || result.data.weight === undefined) {
        const userResult = await getUser(req.user.aid);
        if (!result.success) {
            return res.status(404).send("User not found");
        }
        userInfo = {
            gender: result.data.gender ? result.data.gender : userResult.data.gender,
            age: result.data.age ? result.data.age : userResult.data.age,
            height: result.data.height ? result.data.height : userResult.data.height,
            weight: result.data.weight ? result.data.weight : userResult.data.weight,
        };
    }
    else {
        userInfo = {
            gender: result.data.gender,
            age: result.data.age,
            height: result.data.height,
            weight: result.data.weight,
        };
    }
    // Call model service
    console.log("Calling model");
    const modelResult = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: JSON.stringify({
            gender: userInfo.gender,
            age: userInfo.age,
            heightCm: userInfo.height,
            weightKg: userInfo.weight,
            restingHeartrate: result.data.restingHeartrate,
            activityMinutes: result.data.physicalActivity,
            dailySteps: result.data.dailySteps,
            sleepDuration: result.data.sleepDuration,
            stressLevel: result.data.stressLevel,
        })
    });
    if (!modelResult.ok) {
        console.error("MODEL ERROPR");
        return res.status(500).send('Internal Server Error');
    }
    const modelData = await modelResult.json();
    if (modelData.predictions.length < 1) {
        console.error("MODEL ERROPR");
        return res.status(500).send('Internal Server Error');
    }
    console.log(modelData.predictions[0]);
    const float = parseFloat(modelData.predictions[0]);
    if (Number.isNaN(float)) {
        return res.status(500).send('Internal Server Error');
    }
    const { error } = await supabase
        .from("insights")
        .insert({
        id: (0, crypto_1.randomUUID)(),
        uid: req.user.id,
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
        sleepQuality: float
    });
    if (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
    return res.status(201).send("ok");
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
async function getUser(uid) {
    try {
        console.log("Searching for", uid);
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("uid", uid)
            .single();
        if (error) {
            console.error(error);
            return {
                success: false
            };
        }
        return {
            success: true,
            data: data
        };
    }
    catch {
        return {
            success: false
        };
    }
}
