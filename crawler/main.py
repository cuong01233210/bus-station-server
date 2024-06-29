import json

import requests
from bs4 import BeautifulSoup

from selenium import webdriver

from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import unidecode


base_url = 'https://buytbuyt.com/tuyen/xe-bus-ha-noi/page/'
# Arrays to store hrefs and bus names
hrefs1 = []
busnames = []
hrefs2 = []
def convert_string(s):
    # Chuyển thành chữ thường
    s = s.lower()
    # Chuyển đổi các ký tự có dấu thành không dấu
    s = unidecode.unidecode(s)
    # Xóa các dấu gạch ngang
    s = s.replace("-", "")
    s = s.replace("(", "")
    s = s.replace(")", "")
    # Xóa các khoảng trắng thừa
    s = s.strip()
    # Chèn dấu gạch ngang giữa các từ
    s = '-'.join(s.split())
    # Ghép thêm phần đầu URL
    s = "https://buytbuyt.com/the/" + s
    return s

def crawl3(iframe):
    # Thiết lập trình duyệt Chrome
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Chạy trình duyệt ở chế độ headless
    driver = webdriver.Chrome(service=service, options=options)

    # Mở trang web
    url = iframe
    driver.get(url)

    # Chờ một chút để đảm bảo trang web tải xong
    driver.implicitly_wait(10)  # Chờ tối đa 10 giây

    # Hàm để tìm các thẻ <li> có thuộc tính data-id trong cả hai chiều đi và chiều về
    def extract_stop_data(direction_id):
        stops = []
        direction_div = driver.find_element(By.ID, direction_id)
        li_elements = direction_div.find_elements(By.CSS_SELECTOR, 'li[data-id]')
        for li in li_elements:
            stopname_span = li.find_element(By.CSS_SELECTOR, 'span[role="stopname"]')
            stops.append((li.get_attribute('data-id'), stopname_span.text))
        return stops

    # Lấy dữ liệu từ chiều đi
    go_stops = extract_stop_data('route_go_direction')

    # Chuyển đổi tab sang chiều về
    back_tab = driver.find_element(By.CSS_SELECTOR, 'a[href="#route_back_direction"]')
    back_tab.click()

    # Chờ một chút để đảm bảo nội dung của chiều về được tải xong
    driver.implicitly_wait(10)

    # Lấy dữ liệu từ chiều về
    back_stops = extract_stop_data('route_back_direction')

    # In dữ liệu
    print("Chiều đi:")
    for stop_id, stop_name in go_stops:
        stop_name = convert_string(stop_name)
        #print(f"ID: {stop_id}, Stop Name: {stop_name}")

    print("\nChiều về:")
    for stop_id, stop_name in back_stops:
        stop_name = convert_string(stop_name)
        #print(f"ID: {stop_id}, Stop Name: {stop_name}")

    # Đóng trình duyệt
    driver.quit()





# Function to extract information from a single page
def extract_info(page_number):
    url = base_url + str(page_number)
    #print(url)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find all articles
    articles = soup.find_all('article', class_='post excerpt')

    for article in articles:
        # Extract href
        link_tag = article.find('a', href=True)
        href = link_tag['href']

        # Extract bus name
        busname_element = link_tag.find('div', class_='featured-cat')

        # Check if busname_element exists
        if busname_element:
            busname = busname_element.text.strip()
        else:
            busname = 'N/A'  # Or handle as you see fit

        # Add to arrays
        hrefs1.append(href)
        busnames.append(busname)


def save_dict_buses_to_json(dict_buses, filename):
    # Chuyển đổi dict_buses thành danh sách các từ điển
    bus_stations = []
    for stop_name, details in dict_buses.items():
        bus_station = {
            "name": stop_name,
            "bus": details["buses"],
            "lat": details["lat"],
            "long": details["long"]
        }
        bus_stations.append(bus_station)

    # Lưu danh sách vào tệp JSON
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(bus_stations, file, ensure_ascii=False, indent=4)

def save_bus_routes_to_json(bus_routes, filename):
    # Lưu danh sách bus_routes vào tệp JSON
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(bus_routes, file, ensure_ascii=False, indent=4)
def crawl():
    dict_buses = {}
    routeGoDirections = []
    routeBackDirections = []
    bus_routes = []
    # Crawl first web to take second web links
    for page in range(1, 15):
        extract_info(page)

    # Use last href and bus name for demonstration purposes
    #hrefs1d = hrefs1[-2:]
    #busnamesd = busnames[-2:]
    hrefs1d = hrefs1[13:]
    busnamesd = busnames[13:]

    print("Hrefs:", hrefs1)
    print("Bus names:", busnamesd)
    print("Hrefs length", len(hrefs1d))
    print("Busnames length", len(busnamesd))

    for i in range(len(hrefs1d)):
        response = requests.get(hrefs1d[i])
        content = response.content
        print("tuyen: ", busnamesd[i])
        routeGo = {}
        routeBack = {}
        soup = BeautifulSoup(content, "html.parser")
        iframe = soup.find("iframe")
        iframe_src = iframe['src'] if iframe else None

        if iframe_src and not iframe_src.startswith("https://"):
            iframe_src = "https://buytbuyt.com/" + iframe_src

            service = Service(ChromeDriverManager().install())
            options = webdriver.ChromeOptions()
            options.add_argument("--headless")
            driver = webdriver.Chrome(service=service, options=options)

            url = iframe_src
            driver.get(url)
            driver.implicitly_wait(10)

            def extract_stop_data(direction_id):
                stops = []
                direction_div = driver.find_element(By.ID, direction_id)
                li_elements = direction_div.find_elements(By.CSS_SELECTOR, 'li[data-id]')
                for li in li_elements:
                    stopname_span = li.find_element(By.CSS_SELECTOR, 'span[role="stopname"]')
                    stops.append((li.get_attribute('data-id'), stopname_span.text))
                return stops

            go_stops = extract_stop_data('route_go_direction')
            back_tab = driver.find_element(By.CSS_SELECTOR, 'a[href="#route_back_direction"]')
            back_tab.click()
            driver.implicitly_wait(10)
            back_stops = extract_stop_data('route_back_direction')

            print("Chiều đi:")
            for stop_id, stop_name in go_stops:
                print(stop_name)
                if stop_name not in dict_buses:
                    dict_buses[stop_name] = {
                        "buses": [],
                        "lat": 0,
                        "long": 0
                    }
                if busnamesd[i] not in dict_buses[stop_name]["buses"]:
                    dict_buses[stop_name]["buses"].append(busnamesd[i])

                routeGo = {
                    "name": stop_name,
                    "buses": [],
                    "lat": 0,
                    "long": 0
                }
                routeGo["buses"].append(busnamesd[i])


                stop_name_convert = convert_string(stop_name)
                response = requests.get(stop_name_convert)
                web_content = response.text
                soup = BeautifulSoup(web_content, 'html.parser')

                marker_div = soup.find('div', class_='marker')
                latitude = 0
                longitude = 0
                if marker_div:
                    latitude = marker_div.get('data-latitude')
                    longitude = marker_div.get('data-longitude')

                    if latitude is not None and longitude is not None:
                        try:
                            latitude = float(latitude)
                            longitude = float(longitude)
                            dict_buses[stop_name]["lat"] = latitude
                            dict_buses[stop_name]["long"] = longitude
                            routeGo["lat"] = latitude
                            routeGo["long"] = longitude
                        except ValueError:
                            print("Không thể chuyển đổi latitude hoặc longitude sang số thực.")
                    else:
                        print("Không tìm thấy latitude hoặc longitude trong div marker.")
                else:
                    print("Không tìm thấy thẻ div với lớp marker.")
                routeGoDirections.append(routeGo)

            print("\nChiều về:")
            for stop_id, stop_name in back_stops:
                print(stop_name)
                if stop_name not in dict_buses:
                    dict_buses[stop_name] = {
                        "buses": [],
                        "lat": 0,
                        "long": 0
                    }
                if busnamesd[i] not in dict_buses[stop_name]["buses"]:
                    dict_buses[stop_name]["buses"].append(busnamesd[i])

                routeBack = {
                    "name": stop_name,
                    "buses": [],
                    "lat": 0,
                    "long": 0
                }
                routeBack["buses"].append(busnamesd[i])

                stop_name_convert = convert_string(stop_name)
                response = requests.get(stop_name_convert)
                web_content = response.text
                soup = BeautifulSoup(web_content, 'html.parser')

                marker_div = soup.find('div', class_='marker')
                latitude = 0
                longitude = 0
                if marker_div:
                    latitude = marker_div.get('data-latitude')
                    longitude = marker_div.get('data-longitude')

                    if latitude is not None and longitude is not None:
                        try:
                            latitude = float(latitude)
                            longitude = float(longitude)
                            dict_buses[stop_name]["lat"] = latitude
                            dict_buses[stop_name]["long"] = longitude
                            routeBack["lat"] = latitude
                            routeBack["long"] = longitude
                        except ValueError:
                            print("Không thể chuyển đổi latitude hoặc longitude sang số thực.")
                    else:
                        print("Không tìm thấy latitude hoặc longitude trong div marker.")
                else:
                    print("Không tìm thấy thẻ div với lớp marker.")
                routeBackDirections.append(routeBack)
            driver.quit()
            bus_routes.append({
                "bus": busnamesd[i],
                "price": 7000,
                "activityTime": "5h00 -> 21h00",
                "gianCachChayXe": "10 -> 15 phút/chuyến",
                "gianCachTrungBinh": 15,
                "chieuDi": routeGoDirections,
                "chieuVe": routeBackDirections
            })
            routeGoDirections = []
            routeBackDirections = []

    #print(dict_buses)
    #print(bus_routes)
    #save_dict_buses_to_json(dict_buses, 'bus_stations.json')
    #save_bus_routes_to_json(bus_routes, 'data_route.json')

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    crawl()
