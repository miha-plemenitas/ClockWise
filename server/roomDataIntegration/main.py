import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
from data import data


def extract_data(driver):
    tbody_xpath = '//*[@id="roomFilterForm:roomFilter_data"]'

    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, tbody_xpath)))

    rows = driver.find_elements(By.XPATH, f"{tbody_xpath}/tr")
    room_list = []

    for row in rows:
        columns = row.find_elements(By.TAG_NAME, "td")

        if len(columns) >= 4:
            room_data = {
                'roomName': columns[1].text.strip(),
                'size': columns[2].text.strip(),
                'equipment': columns[3].text.strip() if len(columns) > 3 else 'No Equipment'
            }
            print(room_data)
            room_list.append(room_data)
        else:
            print("Skipped a row due to insufficient data:", [col.text for col in columns])

    return room_list


all_schools_data = []

for school in data:
    driver = webdriver.Chrome()
    driver.get(school["URL"])

    try:
        WebDriverWait(driver, 20).until(lambda d: d.execute_script('return jQuery.active == 0'))
        WebDriverWait(driver, 20).until(lambda d: d.execute_script('return document.readyState') == 'complete')

        element = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.ID, school["element"]))
        )
        element.click()
        print("Clicked filter by rooms")
        sleep(5)

        rooms = extract_data(driver)

        next_button_xpath = '//*[@id="roomFilterForm:roomFilter_paginator_bottom"]/span[5]'
        while True:
            next_button = driver.find_element(By.XPATH, next_button_xpath)
            if 'ui-state-disabled' in next_button.get_attribute('class'):
                break
            next_button.click()
            sleep(2)
            rooms.extend(extract_data(driver))

        all_schools_data.append(rooms)
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        driver.get_screenshot_as_file('/mnt/data/last_interaction.png')
        driver.quit()


with open('schools_room_data.json', 'w') as file:
    json.dump(all_schools_data, file)

print("Data has been written to schools_room_data.json")