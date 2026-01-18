# Backend

# API Schema
## POST /users
Authentication Required \
Input: 
```
{
  name: string
  gender: string // either Male/Female
  age: number // 1-100
  height: number in cm
  weight: number in kg
}
```
Response 201 \
This endpoints populates the user data, of an authenticated user. It should be called after onboarding. ALL fields are required.

## PUT /users
Input:
```
{
  name: string
  gender: string // either Male/Female
  age: number // 1-100
  height: number // in cm
  weight: number // in kg
}
```
Response 204 \
This endpoint updates the user data. Only one field is needed for a valid request.

## GET /users
Response 200
404 if no user created but authorized
```
{
  name: string
  gender: string // either Male/Female
  age: number // 1-100
  height: number in cm
  weight: number in kg
}
```

## POST /insights
Input:
```
{
  gender: string // either Male/Female
  age: number // 1-100
  height: number in cm
  weight: number in kg

  sleepDuration: number // in hours
  physicalActivity: number (of minutes)

  restingHeartrate: number | null//50-200
  dailySteps: number | null
  stressLevel: number | null //1-10
}
```
This enpoints asks the model for advice, this could take awhile. gender age height and weight are optional if the user has populated data. restingHeartrate, dailySteps and stressLevel are always optional.

Reponse
```
{
  sleepQuality: number // 1-10
}
```
## GET /insights
Add ?key=string for pagination

Result: 200
```
{
  results: {
    id: stringgender: string // either Male/Female
    age: number // 1-100
    height: number in cm
    weight: number in kg

    sleepDuration: number // in hours
    physicalActivity: number (of minutes)

    restingHeartrate: number | null//50-200
    dailySteps: number | null
    stressLevel: number | null //1-10

    sleepQuality:number // 1-10
    date: string // iso format of sleep
  }[],
  lastKey?: string
}
```
Note responses limited to 100