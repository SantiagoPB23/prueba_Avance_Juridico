import xml.etree.ElementTree as ET
import json

def xml_to_dict(element):
    node = {
        "tag": element.tag,
        "attributes": element.attrib,
        "text": element.text.strip() if element.text else None,
        "children": [xml_to_dict(child) for child in element]
    }
    return node

# Carga el archivo et
tree = ET.parse('full/et.xml')
root = tree.getroot()

# lo convierte
xml_dict = xml_to_dict(root)

# Guarda el json
with open('et_structure.json', 'w', encoding='utf-8') as file:
    json.dump(xml_dict, file, ensure_ascii=False, indent=4)
print("Archivo JSON generado: et_structure.json")
