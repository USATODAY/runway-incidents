import xlrd
import json
import datetime
 
# Open the workbook
wb = xlrd.open_workbook('source/runway-incursions.xlsx')

# Get the first sheet either by index or by name
sh = wb.sheet_by_index(0)

# List to store incidents
incident_list = []

# Dictionary to store airpots
airport_dict = {}

airport_list = []

# Table headers
header_list = sh.row_values(0)
 
# Iterate through each row in worksheet and fetch values into dict
print "Going through the Excel sheet now..."

for rownum in range(1, sh.nrows):
  incident = {}
  row_values = sh.row_values(rownum)

  for colnum in range(len(row_values)):
    if colnum == 1:
      date = xlrd.xldate_as_tuple(row_values[colnum], wb.datemode)
      value = str(date[1]) + "-" + str(date[2]) + "-" + str(date[0])
        
    else:
      value = row_values[colnum]

    incident[header_list[colnum]] = value

  incident_list.append(incident)

print "Done!"
 
print "Organizing the incidents by Airport"
for entry in incident_list:
  airport_code = entry["Airport code"]

    
  if airport_code in airport_dict.keys():
    airport_dict[airport_code]["number_of_incidents"] +=  1
    airport_dict[airport_code][entry["Severity category"]] += 1

  else:
    obj = {}
    obj["full_name"] = entry["Airport name"]
    obj["state"] = entry["State"]
    obj["number_of_incidents"] = 1
    obj["A"] = 0
    obj["B"] = 0
    obj["C"] = 0
    obj["D"] = 0
    obj["E"] = 0
    obj["P"] = 0
    obj["N/A"] = 0
    airport_dict[airport_code] = obj 
    airport_dict[airport_code][entry["Severity category"]] += 1

for key in airport_dict:
  result_dict = airport_dict[key]
  result_dict["airport"] = key
  airport_list.append(result_dict)


print "Done!"

print "Saving data to output/airports folder..."
for airport in airport_dict:
  print "Saving %s..." % airport
  with open ("output/airports/%s.json" % airport, "w") as f:
    json.dump(airport_dict[airport], f)
  print "Success!"

print "Saving Summary file..."
with open ("output/summary.json", "w") as f:
  json.dump(airport_list, f)
print "Success!"
