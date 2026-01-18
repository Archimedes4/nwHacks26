import random
import csv
from dataclasses import dataclass

random.seed(42)

HEADERS = [
    "Person ID","Gender","Age","Occupation","Sleep Duration","Quality of Sleep",
    "Physical Activity Level","Stress Level","BMI Category","Blood Pressure",
    "Heart Rate","Daily Steps","Sleep Disorder"
]

OCCUPATIONS = [
    "Software Engineer","Doctor","Nurse","Teacher","Engineer","Accountant",
    "Lawyer","Scientist","Sales Representative","Manager","Salesperson"
]

@dataclass
class Person:
    pid: int
    gender: str
    age: int
    occupation: str
    sleep_duration: float
    sleep_quality: int
    physical_activity: int
    stress: int
    bmi: str
    systolic: int
    diastolic: int
    heart_rate: int
    daily_steps: int
    disorder: str

def clamp(x, lo, hi):
    return lo if x < lo else hi if x > hi else x

def weighted_choice(items, weights):
    # items: list, weights: list same length
    r = random.random() * sum(weights)
    s = 0.0
    for it, w in zip(items, weights):
        s += w
        if r <= s:
            return it
    return items[-1]

def pick_bmi(age: int, activity: int):
    # More activity -> lower BMI; more age -> slightly higher BMI
    # (still synthetic)
    score = (age - 30) * 0.02 - (activity - 50) * 0.015 + random.gauss(0, 0.35)
    if score < -0.5:
        return "Normal"
    elif score < 0.25:
        return "Normal Weight"
    elif score < 0.9:
        return "Overweight"
    else:
        return "Obese"

def base_steps(activity: int, occupation: str):
    # Occupation nudges steps
    occ_bias = {
        "Sales Representative": 800,
        "Salesperson": 700,
        "Teacher": 600,
        "Nurse": 900,
        "Doctor": 500,
        "Software Engineer": -600,
        "Engineer": -300,
        "Accountant": -500,
        "Lawyer": -400,
        "Scientist": -200,
        "Manager": -250,
    }.get(occupation, 0)

    steps = 2500 + activity * 90 + occ_bias + random.gauss(0, 600)
    return int(clamp(round(steps / 100) * 100, 1500, 16000))

def synth_sleep(activity: int, stress: int, age: int, bmi: str):
    # Sleep duration depends on stress and a bit on activity; older slightly lower.
    dur = 7.2 - 0.22 * (stress - 5) + 0.012 * (activity - 50) - 0.01 * (age - 40)
    if bmi == "Obese":
        dur -= 0.15
    dur += random.gauss(0, 0.35)
    dur = clamp(dur, 4.2, 9.3)
    dur = round(dur, 1)

    # Sleep quality mostly follows duration and stress
    q = 6 + 0.9 * (dur - 7.0) - 0.55 * (stress - 5) + random.gauss(0, 0.7)
    if bmi in ["Overweight", "Obese"]:
        q -= 0.3
    q = int(clamp(round(q), 3, 10))
    return dur, q

def synth_bp(age: int, stress: int, bmi: str, activity: int):
    # Systolic/diastolic: age + stress + BMI increase; activity decreases.
    bmi_add = {"Normal": 0, "Normal Weight": 1, "Overweight": 6, "Obese": 12}[bmi]
    sys = 112 + (age - 30) * 0.45 + (stress - 5) * 2.2 + bmi_add - (activity - 50) * 0.10 + random.gauss(0, 5)
    dia = 74 + (age - 30) * 0.22 + (stress - 5) * 1.3 + bmi_add * 0.45 - (activity - 50) * 0.06 + random.gauss(0, 3)
    sys = int(clamp(round(sys), 95, 165))
    dia = int(clamp(round(dia), 60, 110))
    return sys, dia

def synth_hr(activity: int, stress: int, age: int, bmi: str):
    # Resting HR lower w/ activity; higher w/ stress/BMI
    bmi_add = {"Normal": 0, "Normal Weight": 1, "Overweight": 3, "Obese": 6}[bmi]
    hr = 72 - 0.10 * (activity - 50) + 1.2 * (stress - 5) + 0.05 * (age - 40) + bmi_add + random.gauss(0, 3)
    return int(clamp(round(hr), 55, 105))

def synth_disorder(bmi: str, sleep_duration: float, quality: int, stress: int):
    # Very rough synthetic logic:
    # - Apnea more likely with obesity/overweight and short-ish sleep/low quality
    # - Insomnia more likely with high stress and short sleep/low quality
    p_none = 0.72
    p_apnea = 0.12
    p_insomnia = 0.16

    if bmi == "Overweight":
        p_apnea += 0.07
        p_none -= 0.06
    if bmi == "Obese":
        p_apnea += 0.18
        p_none -= 0.14

    if stress >= 8:
        p_insomnia += 0.12
        p_none -= 0.10
    if sleep_duration <= 6.0 or quality <= 5:
        p_insomnia += 0.10
        p_none -= 0.08
    if sleep_duration >= 8.0 and quality >= 8 and stress <= 5:
        p_none += 0.08
        p_apnea -= 0.03
        p_insomnia -= 0.05

    # normalize + clamp
    p_none = max(0.05, p_none)
    p_apnea = max(0.02, p_apnea)
    p_insomnia = max(0.02, p_insomnia)
    s = p_none + p_apnea + p_insomnia
    p_none, p_apnea, p_insomnia = p_none/s, p_apnea/s, p_insomnia/s

    return weighted_choice(["None", "Sleep Apnea", "Insomnia"], [p_none, p_apnea, p_insomnia])

def make_row(pid: int) -> Person:
    gender = random.choice(["Male", "Female"])
    # A fairly adult distribution
    age = int(clamp(round(random.gauss(41, 9)), 18, 65))

    occupation = weighted_choice(
        OCCUPATIONS,
        # Heavier on common-ish roles similar to your dataset
        [12, 10, 9, 9, 10, 8, 7, 6, 6, 5, 6]
    )

    # Activity depends on occupation a bit
    occ_activity_bias = {
        "Nurse": 10, "Teacher": 6, "Sales Representative": 6, "Salesperson": 7,
        "Doctor": 3, "Scientist": 2, "Engineer": 0, "Software Engineer": -6,
        "Accountant": -6, "Lawyer": -3, "Manager": -2
    }.get(occupation, 0)

    physical_activity = int(clamp(round(random.gauss(55 + occ_activity_bias, 18)), 15, 95))

    # Stress depends on occupation a bit
    occ_stress_bias = {
        "Nurse": 1, "Doctor": 1, "Lawyer": 1,
        "Sales Representative": 1, "Salesperson": 1,
        "Manager": 1,
        "Software Engineer": 0, "Engineer": 0, "Scientist": 0,
        "Teacher": 0, "Accountant": 0
    }.get(occupation, 0)

    stress = int(clamp(round(random.gauss(6 + occ_stress_bias, 1.6)), 1, 10))

    bmi = pick_bmi(age, physical_activity)

    sleep_duration, sleep_quality = synth_sleep(physical_activity, stress, age, bmi)

    sys, dia = synth_bp(age, stress, bmi, physical_activity)

    heart_rate = synth_hr(physical_activity, stress, age, bmi)

    daily_steps = base_steps(physical_activity, occupation)

    disorder = synth_disorder(bmi, sleep_duration, sleep_quality, stress)

    return Person(
        pid=pid,
        gender=gender,
        age=age,
        occupation=occupation,
        sleep_duration=sleep_duration,
        sleep_quality=sleep_quality,
        physical_activity=physical_activity,
        stress=stress,
        bmi=bmi,
        systolic=sys,
        diastolic=dia,
        heart_rate=heart_rate,
        daily_steps=daily_steps,
        disorder=disorder
    )

def person_to_csv_row(p: Person):
    return [
        p.pid,
        p.gender,
        p.age,
        p.occupation,
        f"{p.sleep_duration:.1f}",
        p.sleep_quality,
        p.physical_activity,
        p.stress,
        p.bmi,
        f"{p.systolic}/{p.diastolic}",
        p.heart_rate,
        p.daily_steps,
        p.disorder
    ]

def generate_csv(path="input/gpt_train.csv", n=1000):
    rows = [make_row(i) for i in range(1, n+1)]
    # already sorted by Person ID due to generation order
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(HEADERS)
        for p in rows:
            w.writerow(person_to_csv_row(p))
    print(f"Wrote {n} rows to {path}")

if __name__ == "__main__":
    generate_csv()
