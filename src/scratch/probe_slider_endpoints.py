import urllib.request
import urllib.error
import json

base_url = "https://api.bsguplms.in"

paths = [
    "bsgupadmin/slider/",
    "bsgupadmin/sliders/",
    "bsgupadmin/slider-images/",
    "bsgupadmin/slider-image/",
    "bsgupadmin/hero-images/",
    "bsgupadmin/hero-image/",
    "bsgupadmin/banner/",
    "bsgupadmin/banners/",
    "bsgupadmin/carousel/",
    "bsgupadmin/carousels/",
    "bsgupadmin/carousel-image/",
    "bsgupadmin/carousel-images/",
    "bsgupadmin/homepage/",
    "bsgupadmin/home-images/",
    "bsgupadmin/home-image/",
    "bsgupadmin/images/",
    "bsgupadmin/image/",
]

methods = ["GET", "POST", "DELETE"]

print("Probing endpoints...")
for path in paths:
    for method in methods:
        url = f"{base_url}/{path}"
        req = urllib.request.Request(url, method=method)
        try:
            with urllib.request.urlopen(req, timeout=3) as response:
                print(f"FOUND: {method} {url} -> {response.status}")
                body = response.read().decode('utf-8')
                print(f"  Body: {body[:200]}")
        except urllib.error.HTTPError as e:
            if e.code != 404:
                print(f"EXIST?: {method} {url} -> {e.code}")
                try:
                    body = e.read().decode('utf-8')
                    print(f"  Body: {body[:200]}")
                except:
                    pass
        except Exception as e:
            pass

print("Probing completed.")
