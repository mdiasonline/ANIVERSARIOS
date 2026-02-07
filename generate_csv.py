import random

names = [
    "Ana", "Beatriz", "Carlos", "Daniel", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Julia",
    "Karla", "Lucas", "Mariana", "Nicolas", "Olivia", "Paulo", "Quintino", "Rafael", "Sofia", "Thiago",
    "Ursula", "Vinicius", "Wagner", "Xavier", "Yuri", "Zara", "Amanda", "Bruno", "Camila", "Diego"
]

last_names = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
    "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa"
]

def get_random_date(month):
    year = random.randint(1980, 2005)
    day = random.randint(1, 28)
    return f"{year}-{month:02d}-{day:02d}"

header = "nome,data,telefone,email,foto"
rows = [header]

print("Generando dados...")

for month in range(1, 13):
    for i in range(10):
        first = random.choice(names)
        last = random.choice(last_names)
        name = f"{first} {last}"
        date = get_random_date(month)
        phone = f"119{random.randint(10000000, 99999999)}"
        email = f"{first.lower()}.{last.lower()}@exemplo.com"
        gender = "women" if first[-1] == 'a' else "men"
        photo_id = random.randint(1, 99)
        photo = f"https://randomuser.me/api/portraits/{gender}/{photo_id}.jpg"
        
        rows.append(f"{name},{date},{phone},{email},{photo}")

with open("sample_birthdays.csv", "w") as f:
    f.write("\n".join(rows))

print("sample_birthdays.csv criado com sucesso!")
