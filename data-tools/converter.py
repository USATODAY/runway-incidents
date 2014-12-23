import xlrd
import json

# Set filename of source (should be in the `source` folder)
filename = "runways_by_airport"
output_name = "incidents_by_airport"

# Open the workbook
wb = xlrd.open_workbook('source/%s.xlsx' % filename) 

# Get the first sheet either by index or by name
sh = wb.sheet_by_index(0)

# List to store airports
airport_list = []


# Iterate through each row in worksheet and fetch values into dict
print "Going through the Excel sheet now..."

for rownum in range(1, sh.nrows):
  airport = {}
  row_values = sh.row_values(rownum)
  airport["code"] = row_values[0]
  airport["name"] = row_values[1]
  airport["st"] = row_values[2]
  airport["01"] = int(row_values[3])
  airport["02"] = int(row_values[4])
  airport["03"] = int(row_values[5])
  airport["04"] = int(row_values[6])
  airport["05"] = int(row_values[7])
  airport["06"] = int(row_values[8])
  airport["07"] = int(row_values[9])
  airport["08"] = int(row_values[10])
  airport["09"] = int(row_values[11])
  airport["10"] = int(row_values[12])
  airport["11"] = int(row_values[13])
  airport["12"] = int(row_values[14])
  airport["13"] = int(row_values[15])
  airport["14"] = int(row_values[16])
  airport["tot"] = int(row_values[17])
  airport["com"] = int(row_values[18])
  airport["sev"] = int(row_values[19])

  # append incedent to list
  airport_list.append(airport)

print "Saving new json file..."
with open ("output/%s.json" % output_name, "w") as f:
  json.dump(airport_list, f)

print "Success!"