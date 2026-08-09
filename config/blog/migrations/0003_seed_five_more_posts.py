from django.db import migrations
from django.utils.text import slugify

POSTS = [
    {
        "title": "Understanding Smart Hydrology Alerts: Flagging Flood Risk Before It Happens",
        "excerpt": (
            "How Conduit turns rainfall totals and barometric pressure trends "
            "into a 0-100 runoff risk score, and what each severity band "
            "means for the ground underneath a station."
        ),
        "tags": ["Alerts", "Hydrology"],
        "content": """Most flood warnings arrive after the water is already rising. Smart Hydrology, one of the two alert types built into Conduit, is designed to give an earlier signal by watching the two variables that tend to move before runoff does: rainfall and barometric pressure.

The scoring is deliberately simple. Rather than a machine learning model, it's a rule-based system that awards points out of a possible 100. Rainfall accumulated over a configurable lookback window contributes up to 70 of those points, scored in bands — the heavier the recent rainfall, the more points it adds, with even a trace amount below 5mm contributing a small baseline score. Pressure trend contributes the remaining 30 points. A falling trend, which often precedes a storm system, scores highest; a steady trend scores a little; a rising trend, associated with clearing conditions, scores nothing.

## From score to recommendation

Once a station's runoff risk score is calculated, it's classified into one of four severity bands: low, moderate, high, or extreme. Each band carries a plain-language recommendation rather than a raw number. A low score means it's safe to apply fertilizer. Moderate means monitor the weather. High means delay fertilizer application. Extreme means don't apply it at all — heavy runoff would just carry it into waterways instead of into the soil.

That mapping is intentional. The people using this alert type day to day are often farmers and agronomists making a fertilizer-timing decision, not hydrologists reading a raw index. Translating the score into an action removes a step they'd otherwise have to do themselves, and reduces nutrient runoff into rivers and dams downstream.

## Coalescence: one alert per condition, not one per reading

A weather station reports frequently, and rainfall conditions don't change instantly. Without some care, that would mean a fresh "flood risk" alert firing every time a new measurement came in as long as conditions stayed above the alert threshold. Conduit avoids that with a coalescence rule: while a hydrology alert for a station is still active, no new one is opened for the same condition. Only once the score drops back down and the existing alert is resolved can the next crossing open a new one.

The result is an alert history you can actually read — one entry per flood-risk episode, not one per API poll — while still giving you the option to subscribe to a webhook and get notified the moment a new episode starts or an existing one clears.

If you want to see this in practice, the /alerts/ endpoint returns hydrology alerts alongside their runoff risk score, rainfall summary, pressure trend, and recommendation for any station you have access to.""",
    },
    {
        "title": "Livestock Thermal Stress: Reading the WBGT Index for Better Herd Management",
        "excerpt": (
            "Heat stress costs herds long before it becomes visible. Here's "
            "how Conduit's livestock alerts use the Wet Bulb Globe "
            "Temperature index to catch it early."
        ),
        "tags": ["Alerts", "Livestock"],
        "content": """Heat stress in livestock is easy to underestimate because the early signs — reduced feed intake, lower milk yield, restlessness — look like a dozen other things. By the time it's obvious, productivity has usually already taken a hit. Conduit's livestock thermal alerts exist to catch the underlying condition before it gets to that point.

The metric behind this alert type is WBGT, the Wet Bulb Globe Temperature index. Unlike a simple air temperature reading, WBGT accounts for humidity, solar radiation, and wind, which makes it a much better proxy for how much heat stress an animal actually experiences standing out in a field. Each weather station computes WBGT as part of its regular measurement, so Conduit doesn't need to derive it — it just watches the value as it comes in.

## How the threshold works

Every measurement is compared against a configurable WBGT threshold. Once a reading crosses that threshold, an alert opens, and the size of the crossing determines severity: a small overshoot is classified as moderate, a bigger one as high, and a large overshoot as extreme. Because the alert only opens once the threshold is already crossed, there's no "low" severity in this alert type by design — low heat stress risk simply doesn't generate an alert at all.

Measurements are walked in time order per station, and the same coalescence logic used for hydrology applies here too: while a heat-stress alert is active for a station, further crossings don't spawn duplicates. The alert stays open until conditions ease and WBGT drops back under the threshold, at which point it resolves and the station is ready to open a fresh alert on the next crossing.

## Why the threshold is configurable, not fixed

Heat tolerance varies by breed, by acclimatization, and by what's practical for a given operation, so Conduit doesn't hardcode a single WBGT cutoff. It's set via configuration and can be tuned per deployment. A dairy operation running Holsteins in a hot climate might want a lower, more conservative threshold than a hardier breed adapted to the local conditions.

Whatever threshold you land on, the payoff is the same: a heads-up to move shade, adjust feeding times, or increase water access before productivity — or animal welfare — takes the hit that heat stress otherwise causes quietly.""",
    },
    {
        "title": "From Sensor to Dashboard: How Conduit's Ingestion Pipeline Keeps Data Fresh",
        "excerpt": (
            "A look at what happens between a weather station taking a "
            "reading and that reading showing up through the API — and how "
            "Conduit keeps that pipeline honest."
        ),
        "tags": ["API", "Ingestion"],
        "content": """An API is only as useful as the data behind it is fresh. Conduit's ingestion layer exists to make sure the gap between "a weather station just measured something" and "that measurement is queryable through the API" stays as small and as reliable as possible.

Underneath, ingestion pulls from FEWSNET, the upstream weather data source, on a schedule. Each sync run is logged, which means every ingestion run is its own auditable record: when it started, how many measurements it pulled in, whether it succeeded, and what went wrong if it didn't. That matters more than it sounds — a silent ingestion failure is far worse than a loud one, because a silent one just looks like calm weather until someone notices the numbers stopped moving.

## Why sync is a scheduled job, not a live proxy

It would be simpler, on paper, to just proxy every request straight through to the upstream source. Conduit doesn't do that, for a few reasons. First, upstream APIs have their own rate limits, and a live proxy would tie Conduit's availability directly to theirs. Second, storing measurements locally is what makes historical queries, pagination, and the alert engines possible — Smart Hydrology and livestock thermal alerts both need to look back over a window of past readings, which only works if that history is sitting in Conduit's own database rather than being re-fetched on every request.

So instead, ingestion runs on its own schedule, writes what it collects into the same measurement tables the /stations/ and /history/ endpoints read from, and the alert engines run against that stored history right after. By the time a new measurement is visible through the API, it's already been evaluated for hydrology and livestock alert conditions.

## What this means if you're building on top of it

If you're polling /stations/<slug>/current/, you're reading the most recent successfully ingested measurement for that station — not a live pass-through to the sensor. In practice the lag is small, but it's worth knowing it exists, especially if your application cares about second-by-second precision rather than minute-by-minute trends.

And if a station goes quiet — no new readings for longer than expected — that's visible in the ingestion run history before it ever becomes a mystery in your own application's logs.""",
    },
    {
        "title": "Webhooks 101: Building Real-Time Integrations on Conduit",
        "excerpt": (
            "Polling /alerts/ works, but it's not the only option. Here's "
            "how to get an HTTP callback the moment an alert fires or "
            "resolves, and how to verify it's really from Conduit."
        ),
        "tags": ["Webhooks", "Developers"],
        "content": """Polling an endpoint every few minutes to check whether anything new has happened is a fine way to start, but it doesn't scale well and it always trades off freshness against request volume. Conduit's webhook system exists so you don't have to make that trade-off for alerts specifically.

A webhook subscription is a URL you register, along with which events you want delivered to it. Right now that's alert.created and alert.resolved, and you can narrow a subscription to a specific alert type — hydrology or livestock — or a specific station, so you're only notified about the conditions you actually care about.

## Setting one up

Creating a subscription is a JWT-authenticated action, done through your account rather than an API key, since it's a dashboard-style operation rather than a data read. When you create one, the response includes a secret — and that's the only time you'll ever see it in full. It's generated server-side and used to HMAC-sign every payload Conduit delivers to your URL, so your receiving endpoint can verify that a request claiming to be from Conduit actually is. Store it somewhere safe the moment you get it.

Once it's set up, you can send yourself a test ping before wiring up real logic, and you can inspect the delivery history for a subscription at any time — every attempt, successful or not, is logged with its response status and any error message, so a failed delivery isn't a silent mystery.

## What happens when a delivery fails

Networks are unreliable and receiving servers go down, so Conduit doesn't give up on the first failed attempt. Failed deliveries are retried, up to a configurable maximum attempt count, on a schedule handled by an internal retry job. If your endpoint was down for five minutes during an alert, you'll still get the delivery once it's back — you don't need to build your own retry-detection logic on top of what Conduit already does.

## When to reach for webhooks instead of polling

If your application needs to react to alerts — paging someone on-call, updating a dashboard in real time, triggering an automated response — webhooks are almost always the better fit than polling /alerts/ on a timer. You get the notification the moment the event happens, not up to a poll-interval later, and you're not spending request quota checking for something that usually hasn't changed.""",
    },
    {
        "title": "Getting Started with the Conduit API: A Developer's First Hour",
        "excerpt": (
            "A practical walkthrough for anyone building against Conduit "
            "for the first time — from getting an API key to your first "
            "successful request."
        ),
        "tags": ["API", "Developers"],
        "content": """Every new integration starts the same way: sign up, get credentials, make one request that works, and go from there. Here's what that first hour looks like on Conduit.

## Step one: create an account and grab an API key

Signing up gets you a Conduit account, and every account can generate one or more API keys from the dashboard. Each key comes with its own rate limit and daily quota, set at reasonable defaults but visible to you so you always know how much headroom you have. Keep the key itself out of client-side code and version control — treat it the way you'd treat any other credential.

## Step two: make your first request

Most of the read endpoints — current station readings, historical measurements, and alerts — accept the key via an x-api-key header. A single request to /stations/ will return the list of stations you have access to, along with each one's slug, which you'll use in most other endpoint paths. From there, /stations/<slug>/current/ gets you the latest reading, and /stations/<slug>/history/ gets you a paginated window of past ones.

## Step three: decide between polling and webhooks

If what you're building just needs to display current or historical data, polling on a sensible interval is perfectly fine — the API is built to handle it, with pagination and rate limits designed around exactly that pattern. But if you care about alerts specifically and want to react the moment one fires or resolves, it's worth setting up a webhook subscription instead of polling /alerts/ on a timer. It's JWT-authenticated rather than API-key-authenticated, since it's a dashboard action, but the payload it delivers references the same alert objects you'd get back from the read endpoints.

## Step four: read the error responses, not just the happy path

Conduit's error responses are structured and consistent across endpoints — expired or invalid credentials come back as 401s, missing resources as 404s, and validation issues as 400s with a body describing what was wrong. Handling these explicitly, rather than assuming every response is a 200 with the shape you expect, will save you a debugging session down the line.

That's genuinely most of what there is to know to get moving. The full reference — every endpoint, every field, every error code — lives on the Documentation page, but the four steps above are enough to go from a fresh account to a working integration in under an hour.""",
    },
]


def seed_posts(apps, schema_editor):
    BlogPost = apps.get_model("blog", "BlogPost")
    from django.utils import timezone

    for post in POSTS:
        BlogPost.objects.get_or_create(
            slug=slugify(post["title"]),
            defaults=dict(
                title=post["title"],
                excerpt=post["excerpt"],
                content=post["content"],
                tags=post["tags"],
                status="published",
                published_at=timezone.now(),
            ),
        )


def unseed_posts(apps, schema_editor):
    BlogPost = apps.get_model("blog", "BlogPost")
    BlogPost.objects.filter(slug__in=[slugify(post["title"]) for post in POSTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0002_seed_intro_post"),
    ]

    operations = [
        migrations.RunPython(seed_posts, unseed_posts),
    ]
