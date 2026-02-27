import requests
from bs4 import BeautifulSoup
import pandas as pd
import math

# Endpoint URL
ENDPOINT = "https://online.uktech.ac.in/ums/Student/Public/ShowStudentAttendanceListByRollNoDOB"

def get_credentials():
    print("======== UKTECH ATTENDANCE & BUNK CALCULATOR ========")
    name = input("Enter your Name: ")
    roll_no = input("Enter your Roll No: ")
    branch_id = int(input("Enter your Branch ID (e.g., 1): "))
    course_duration_id = int(input("Enter your Course Branch Duration ID (e.g., 6): "))
    admission_id = int(input("Enter your Student Admission ID: "))
    year = int(input("Enter Session Year (e.g., 2026): "))
    
    start_month = int(input("Enter starting month for attendance (1-12): "))
    end_month = int(input("Enter ending month for attendance (1-12): "))
    
    classes_per_day = input("Enter average number of classes per day from your timetable (press enter to skip): ")
    classes_per_day = float(classes_per_day) if classes_per_day.strip() else 0.0

    return {
        "NAME": name,
        "ROLL_NO": roll_no,
        "BRANCH_ID": branch_id,
        "COURSE_BRANCH_DURATION_ID": course_duration_id,
        "STUDENT_ADMISSION_ID": admission_id,
        "YEAR": year,
        "START_MONTH": start_month,
        "END_MONTH": end_month,
        "CLASSES_PER_DAY": classes_per_day
    }

def fetch_attendance(config, month):
    payload = {
        "CollegeId": 67, # Dr. APJ AKIT, Tanakpur
        "CourseId": 1, # B.Tech
        "BranchId": config["BRANCH_ID"],
        "CourseBranchDurationId": config["COURSE_BRANCH_DURATION_ID"],
        "StudentAdmissionId": config["STUDENT_ADMISSION_ID"],
        "DateOfBirth": "",
        "SessionYear": config["YEAR"],
        "RollNo": config["ROLL_NO"],
        "Year": config["YEAR"],
        "MonthId": month
    }

    month_total_days = 31 if month in [1, 3, 5, 7, 8, 10, 12] else 28 if month == 2 else 30
    
    print(f"[*] Fetching data for Month {month}...")
    try:
        res = requests.get(ENDPOINT, json=payload)
        if res.status_code != 200:
            print(f"    Failed to fetch data for month {month}. HTTP {res.status_code}")
            return None
            
        record = res.text.encode().decode('unicode-escape')
        soup = BeautifulSoup(record, 'html.parser')

        df = pd.DataFrame(columns=[*range(1, month_total_days + 1), "total", "attended", "percentage"])

        for subject in soup.select('table tbody tr'):
            res = [i.get_text() for i in subject.select('td')]
            if not res or len(res) < month_total_days + 3:
                continue
                
            sub, attendance, total_taken, percentage = res[0], res[1:-3], res[-3:-1], res[-1]
            
            # Mapping attendance strings to numbers mathematically 
            mapped_attendance = []
            for a in attendance:
                a = a.strip()
                if a == "P": mapped_attendance.append(1)
                elif a == "A": mapped_attendance.append(-1)
                elif a == "L": mapped_attendance.append(0)
                elif a in ["P, P", "P,P"]: mapped_attendance.append(2)
                elif a in ["A, A", "A,A"]: mapped_attendance.append(-2)
                else: mapped_attendance.append(None) # Not marked or Holidays
                
            df.loc[sub] = mapped_attendance + total_taken + [percentage]

        return df
    except Exception as e:
        print(f"    Error processing month {month}: {e}")
        return None

def analyze_attendance(df):
    total_attended = 0
    total_conducted = 0
    leaves = 0

    if df is None or df.empty:
        return 0, 0, 0
    
    # We iterate over the dataframe slicing out the last 3 columns (total, attended, percentage)
    for label, row in df.iloc[:, :-3].iterrows():
        for val in row:
            if pd.notna(val):
                if val > 0:
                    total_attended += val
                    total_conducted += val
                elif val < 0:
                    total_conducted += abs(val)
                elif val == 0:
                    leaves += 1

    return total_attended, total_conducted, leaves

def main():
    try:
        config = get_credentials()
    except KeyboardInterrupt:
        print("\nExiting...")
        return
    except ValueError:
        print("\nError: Invalid input provided. Please enter appropriate numbers where required.")
        return
        
    total_att = 0
    total_cond = 0
    total_leaves = 0
    
    # Iterate across specified range of months
    for m in range(config["START_MONTH"], config["END_MONTH"] + 1):
        df = fetch_attendance(config, m)
        att, cond, leaves = analyze_attendance(df)
        total_att += att
        total_cond += cond
        total_leaves += leaves
        
    print("\n" + "="*50)
    print(f"ATTENDANCE REPORT FOR: {config['NAME'].upper()}")
    print("="*50)
    
    if total_cond == 0:
        print("No attendance data found for the selected timeline.")
        return
        
    percentage = (total_att / total_cond) * 100
    print(f"Total Classes Conducted : {total_cond}")
    print(f"Total Classes Attended  : {total_att}")
    print(f"Total Leaves Taken      : {total_leaves}")
    print(f"Current Attendance Avg  : {percentage:.2f}%\n")
    
    print("-" * 50)
    
    # Mathematical logic for Bunking / Attending classes for EXACTLY 75%
    if percentage >= 75:
        # Bunkable mathematical formula: Attended / (Conducted + Bunkable) >= 0.75
        bunkable = math.floor((total_att - 0.75 * total_cond) / 0.75)
        print("Status: SAFE 🟢 (Above 75%)")
        print(f"You can safely bunk {bunkable} classes in a row before dropping below 75%.")
        if config["CLASSES_PER_DAY"] > 0 and bunkable > 0:
            print(f"According to your time table (approx {config['CLASSES_PER_DAY']} classes/day), that's about {bunkable / config['CLASSES_PER_DAY']:.1f} days off!")
    else:
        # Required mathematical formula: (Attended + Required) / (Conducted + Required) >= 0.75
        required = math.ceil(3 * total_cond - 4 * total_att)
        print("Status: DANGER 🔴 (Below 75%)")
        print(f"You must attend {required} consecutive classes to reach exactly 75%.")
        if config["CLASSES_PER_DAY"] > 0 and required > 0:
            print(f"According to your time table (approx {config['CLASSES_PER_DAY']} classes/day), that will take you roughly {math.ceil(required / config['CLASSES_PER_DAY'])} fully-attended days.")
            
    print("="*50)

if __name__ == "__main__":
    main()
