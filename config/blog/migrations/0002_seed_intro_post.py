from django.db import migrations

CONTENT = """Climate change continues to reshape the way communities interact with the environment, making timely and reliable weather information more important than ever. From farmers planning their planting seasons to researchers monitoring environmental changes, access to accurate weather data has become essential for informed decision-making. At the heart of this transformation is the 3D-FEWSNET Weather Data API, an innovative platform developed at JHUB, Jomo Kenyatta University of Agriculture and Technology (JKUAT) to make weather information more accessible, reliable, and actionable.

The 3D-FEWSNET Weather Data API serves as a digital bridge between weather monitoring stations and the people who rely on environmental information. By collecting real-time data from weather stations and making it available through an Application Programming Interface (API), the platform enables developers, researchers, institutions, and innovators to integrate weather information directly into their own applications and systems.

Unlike traditional methods of accessing weather information, which often require manual retrieval or limited public forecasts, the API provides structured and machine-readable data that can be accessed instantly. This makes it possible for developers to build smarter applications that respond to changing weather conditions in real time.

The platform gathers a wide range of environmental data, including temperature, rainfall, humidity, wind speed, atmospheric pressure, solar radiation, and other important meteorological parameters. This information supports a variety of sectors including agriculture, disaster risk management, water resource planning, education, environmental conservation, and climate research.

For the agricultural sector, the Weather Data API has enormous potential. Farmers depend heavily on weather patterns when making decisions about planting, irrigation, harvesting, and pest management. Through applications powered by the API, farmers can receive localized weather updates that help reduce losses caused by unpredictable weather conditions. Accurate weather forecasts can improve crop productivity while promoting sustainable farming practices.

Researchers also benefit significantly from the platform. Access to consistent, real-time environmental data allows scientists to study climate trends, evaluate ecosystem changes, and develop evidence-based solutions to environmental challenges. Universities and research institutions can utilize the API to support academic studies while encouraging innovation among students working on climate-related technologies.

Beyond agriculture and research, the API strengthens disaster preparedness. Extreme weather events such as floods, droughts, and heatwaves continue to affect communities across Africa. Early access to weather information allows authorities and humanitarian organizations to prepare appropriate responses, protecting both lives and livelihoods.

One of the key strengths of the 3D-FEWSNET Weather Data API is its openness and flexibility. Developers can integrate the data into mobile applications, web dashboards, smart irrigation systems, Internet of Things (IoT) devices, and artificial intelligence models. This encourages innovation while creating practical solutions tailored to local needs.

The project also demonstrates JHUB's commitment to supporting digital innovation that addresses real-world challenges. By combining modern software development with environmental science, the platform showcases how universities can contribute to national and regional climate resilience efforts.

As climate risks continue to increase, technologies like the 3D-FEWSNET Weather Data API will become increasingly important. Providing accurate, accessible, and real-time weather information empowers communities, strengthens food security, supports scientific research, and drives sustainable development.

Through this initiative, JHUB continues to position itself as a leader in innovation by transforming raw environmental data into valuable knowledge that improves decision-making and builds resilience for future generations."""

EXCERPT = (
    "How JHUB's 3D-FEWSNET Weather Data API turns raw weather-station "
    "readings into structured, real-time data that farmers, researchers, "
    "and disaster-response teams can build on."
)


def seed_post(apps, schema_editor):
    BlogPost = apps.get_model("blog", "BlogPost")
    from django.utils import timezone
    from django.utils.text import slugify

    BlogPost.objects.get_or_create(
        slug=slugify("Transforming Climate Intelligence Through the 3D-FEWSNET Weather Data API"),
        defaults=dict(
            title="Transforming Climate Intelligence Through the 3D-FEWSNET Weather Data API",
            excerpt=EXCERPT,
            content=CONTENT,
            tags=["Climate", "API", "Agriculture"],
            status="published",
            published_at=timezone.now(),
        ),
    )


def unseed_post(apps, schema_editor):
    BlogPost = apps.get_model("blog", "BlogPost")
    BlogPost.objects.filter(
        slug="transforming-climate-intelligence-through-the-3d-fewsnet-weather-data-api"
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_post, unseed_post),
    ]
