# import re
# from ping3 import ping, verbose_ping
# import time

# import subprocess

# import subprocess
# import time

# import platform

def ping_host(host, count=4, timeout=1, packet_size=64, icmp_version=4):
    latencies = []
    packet_sizes = []
    icmp_versions = []

    system = platform.system()
    if system == "Windows":
        ping_option = "-n"
    elif system == "Linux":
        ping_option = "-c"
    else:
        raise Exception("Unsupported platform")

    for _ in range(count):
        ping_command = f"ping {ping_option} 1 -w {timeout * 1000} -l {packet_size} {'-4' if icmp_version == 4 else '-6'} {host}"
        ping_process = subprocess.Popen(ping_command.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, _ = ping_process.communicate()
        latency_ms = float(re.findall(r"temps=(\d+)\s+ms", stdout.decode('latin1'))[0])
        latencies.append(latency_ms)
        packet_sizes.append(packet_size)
        icmp_versions.append(icmp_version)

    packets_sent = count
    packets_received = len(latencies)
    packets_lost = packets_sent - packets_received
    packet_loss = (packets_lost / packets_sent) * 100
    avg_latency = sum(latencies) / packets_received if packets_received > 0 else float('inf')

    return {
        "host": host,
        "packets_sent": packets_sent,
        "packets_received": packets_received,
        "packets_lost": packets_lost,
        "packet_loss": packet_loss,
        "avg_latency": avg_latency,
        "min_latency": min(latencies) if latencies else None,
        "max_latency": max(latencies) if latencies else None,
        "packet_sizes": packet_sizes,
        "icmp_versions": icmp_versions
    }


# host = "google.com" 
# results = ping_host(host)

# print(f"Host: {results['host']}")
# print(f"Packets sent: {results['packets_sent']}")
# print(f"Packets received: {results['packets_received']}")
# print(f"Packets lost: {results['packets_lost']}")
# print(f"Packet loss: {results['packet_loss']}%")
# print(f"Average latency: {results['avg_latency']} ")
# print(f"Minimum latency: {results['min_latency']} ")
# print(f"Maximum latency: {results['max_latency']} ")
# print(f"Packet sizes: {results['packet_sizes'][0]}")
# print(f"ICMP versions: {results['icmp_versions'][0]}")




# import socket

# def get_ip_address(hostname):
#     try:
#         ip_address = socket.gethostbyname(hostname)
#         return ip_address
#     except socket.gaierror:
#         return None

# hostname = "google.com"
# ip_address = get_ip_address(hostname)
# if ip_address:
#     print(f"L'adresse IP de {hostname} est : {ip_address}")
# else:
#     print(f"Impossible de résoudre l'adresse IP pour {hostname}")


# from scapy.all import IP

# def get_ttl(hostname):
#     try:
#         packet = IP(dst=hostname) / " "
#         ttl = packet.ttl
#         return ttl
#     except Exception as e:
#         print(f"Erreur lors de la récupération du TTL : {e}")
#         return None

# hostname = "google.com"
# ttl = get_ttl(hostname)
# if ttl is not None:
#     print(f"Le TTL vers {hostname} est : {ttl}")
# else:
#     print(f"Impossible de récupérer le TTL vers {hostname}")


# import socket
# import time

# def dns_resolution_info(hostname):
#     try:
#         start_time = time.time()
#         ip_address = socket.gethostbyname(hostname)
#         end_time = time.time()
#         resolution_time = (end_time - start_time) * 1000  # Convert to milliseconds
#         return {
#             "hostname": hostname,
#             "ip_address": ip_address,
#             "resolution_time_ms": resolution_time
#         }
#     except socket.gaierror as e:
#         return {
#             "hostname": hostname,
#             "error": str(e)
#         }

# # Exemple d'utilisation
# hostname = "google.com"
# resolution_info = dns_resolution_info(hostname)
# print(f"Hostname: {resolution_info['hostname']}")
# if 'ip_address' in resolution_info:
#     print(f"IP Address: {resolution_info['ip_address']}")
#     print(f"Resolution Time: {resolution_info['resolution_time_ms']} ms")
# else:
#     print(f"Error: {resolution_info['error']}")


import ssl
import socket
import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend

def get_certificate_info(hostname):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                der_cert = ssock.getpeercert(binary_form=True)
                cert = x509.load_der_x509_certificate(der_cert, default_backend())

                issued_on = cert.not_valid_before
                expires_on = cert.not_valid_after

                issued_on_french = issued_on.strftime("%d-%m-%Y %H:%M:%S")
                expires_on_french = expires_on.strftime("%d-%m-%Y %H:%M:%S")

                serial_number = format(cert.serial_number, 'x').upper()

                return {
                    "hostname": hostname,
                    "issuer": cert.issuer.rfc4514_string(),
                    "issued_on": issued_on_french,
                    "expires_on": expires_on_french,
                    "serial_number": serial_number,
                }
    except ssl.SSLCertVerificationError as e:
        if "certificate has expired" in str(e):
            return {
                "hostname": hostname,
                "issuer": "Expired",
                "issued_on": None,
                "expires_on": "Expired",
                "serial_number": "Expired",
            }
        else:
            return {"error": str(e)}
    except Exception as e:
        return {"error": str(e)}

# Test code
hostname = "corsicalinea.octaedra.com"
certificate_info = get_certificate_info(hostname)

if "error" in certificate_info:
    print(f"Error fetching certificate info: {certificate_info['error']}")
else:
    print(f"Hostname: {certificate_info['hostname']}")
    print(f"Issuer: {certificate_info['issuer']}")
    print(f"Issued On: {certificate_info['issued_on']}")
    print(f"Expires On: {certificate_info['expires_on']}")
    print(f"Serial Number: {certificate_info['serial_number']}")


# import whois

# def get_domain_info(domain):
#     try:
#         domain_info = whois.whois(domain)
#         creation_date = domain_info.creation_date
#         expiration_date = domain_info.expiration_date
#         if isinstance(creation_date, list):
#             creation_date = creation_date[0]
#         if isinstance(expiration_date, list):
#             expiration_date = expiration_date[0]

#         creation_date_in_french = creation_date.strftime("%d-%m-%Y %H:%M:%S")
#         expiration_date_in_french = expiration_date.strftime("%d-%m-%Y %H:%M:%S")

#         return {
#             "domain": domain,
#             "creation_date": creation_date_in_french,
#             "expiration_date": expiration_date_in_french
#         }
#     except Exception as e:
#         return {"error": str(e)}

# # Example usage
# domain = "google.com"
# domain_info = get_domain_info(domain)

# if "error" in domain_info:
#     print(f"Error fetching domain info: {domain_info['error']}")
# else:
#     print(f"Domain: {domain_info['domain']}")
#     print(f"Creation Date: {domain_info['creation_date']}")
#     print(f"Expiration Date: {domain_info['expiration_date']}")


# import requests

# def get_server_version(url):
#     try:
#         response = requests.head(url)
#         server_header = response.headers.get('Server')
#         if server_header:
#             return server_header
#         else:
#             return "Version du serveur non disponible"
#     except requests.exceptions.RequestException as e:
#         return f"Erreur lors de la récupération des en-têtes HTTP : {e}"

# url = "https://corsicalinea.octaedra.com"
# server_version = get_server_version(url)
# print(f"Version du serveur web : {server_version}")

# def get_geolocation(ip_address):
#     try:
#         response = requests.get(f"http://api.ipstack.com/{ip_address}?access_key=YOUR_ACCESS_KEY")
#         data = response.json()
#         country = data.get('country_name')
#         city = data.get('city')
#         return f"Pays : {country}, Ville : {city}"
#     except requests.exceptions.RequestException as e:
#         return f"Erreur lors de la récupération de la localisation : {e}"

# ip_address = "142.250.75.238"  # Adresse IP du serveur web
# location_info = get_geolocation(ip_address)
# print(f"Informations sur la localisation géographique : {location_info}")


# import psutil

# def monitor_cpu_usage():
#     """Surveille l'utilisation du CPU."""
#     cpu_percent = psutil.cpu_percent(interval=1)
#     return cpu_percent

# def monitor_memory_usage():
#     """Surveille l'utilisation de la mémoire."""
#     memory = psutil.virtual_memory()
#     memory_percent = memory.percent
#     memory_total = memory.total
#     memory_used = memory.used
#     memory_free = memory.free
#     memory_available = memory.available
#     return {
#         "memory_percent": memory_percent,
#         "memory_total": memory_total,
#         "memory_used": memory_used,
#         "memory_free": memory_free,
#         "memory_available": memory_available
#     }

# cpu_usage = monitor_cpu_usage()
# memory_usage = monitor_memory_usage()

# print(f"Utilisation du CPU: {cpu_usage}%")
# print(f"Utilisation de la mémoire: {memory_usage['memory_percent']}%")
# print(f"Mémoire totale: {memory_usage['memory_total']} bytes")
# print(f"Mémoire utilisée: {memory_usage['memory_used']} bytes")
# print(f"Mémoire libre: {memory_usage['memory_free']} bytes")
# print(f"Mémoire disponible: {memory_usage['memory_available']} bytes")


# import requests
# import time

# def measure_download_speed(url):
#     """Mesure la vitesse de téléchargement depuis une URL."""
#     start_time = time.time()
#     response = requests.get(url)
#     end_time = time.time()
#     download_speed = len(response.content) / (end_time - start_time) / 1_000_000  # Convertir en Mbits/s
#     return download_speed

# # URL à mesurer
# url = "https://corsicalinea.octaedra.com"

# # Mesurer la vitesse de téléchargement
# download_speed = measure_download_speed(url)
# print(f"Vitesse de téléchargement depuis {url}: {download_speed} Mbits/s")


# import speedtest

# def measure_bandwidth():
#     """Mesure la bande passante."""
#     st = speedtest.Speedtest()
#     download_speed = st.download() / 1_000_000  # Convertir en Mbits/s
#     upload_speed = st.upload() / 1_000_000  # Convertir en Mbits/s
#     return {
#         "download_speed": download_speed,
#         "upload_speed": upload_speed
#     }

# # Test de la fonction
# bandwidth = measure_bandwidth()
# print(f"Bande passante de téléchargement: {bandwidth['download_speed']} Mbits/s")
# print(f"Bande passante de téléversement: {bandwidth['upload_speed']} Mbits/s")







# def get_geolocation(ip_address):
#     try:
#         response = requests.get(f"http://api.ipstack.com/{ip_address}?access_key=YOUR_ACCESS_KEY")
#         data = response.json()
#         country = data.get('country_name')
#         city = data.get('city')
#         return f"Pays : {country}, Ville : {city}"
#     except requests.exceptions.RequestException as e:
#         return f"Erreur lors de la récupération de la localisation : {e}"

# ip_address = "142.250.75.238"  
# location_info = get_geolocation(ip_address)
# print(f"Informations sur la localisation géographique : {location_info}")



# def monitor_cpu_usage():
#     """Surveille l'utilisation du CPU."""
#     cpu_percent = psutil.cpu_percent(interval=1)
#     return cpu_percent

# def monitor_memory_usage():
#     """Surveille l'utilisation de la mémoire."""
#     memory = psutil.virtual_memory()
#     memory_percent = memory.percent
#     memory_total = memory.total
#     memory_used = memory.used
#     memory_free = memory.free
#     memory_available = memory.available
#     return {
#         "memory_percent": memory_percent,
#         "memory_total": memory_total,
#         "memory_used": memory_used,
#         "memory_free": memory_free,
#         "memory_available": memory_available
#     }

# cpu_usage = monitor_cpu_usage()
# memory_usage = monitor_memory_usage()

# print(f"Utilisation du CPU: {cpu_usage}%")
# print(f"Utilisation de la mémoire: {memory_usage['memory_percent']}%")
# print(f"Mémoire totale: {memory_usage['memory_total']} bytes")
# print(f"Mémoire utilisée: {memory_usage['memory_used']} bytes")
# print(f"Mémoire libre: {memory_usage['memory_free']} bytes")
# print(f"Mémoire disponible: {memory_usage['memory_available']} bytes")


import subprocess
import re

def ping_host(host, count=4, timeout=1, packet_size=64, icmp_version=4):
    command = ['ping', '-n', str(count), '-w', str(timeout * 1000), '-l', str(packet_size)]
    if icmp_version == 6:
        command.append('-6')
    else:
        command.append('-4')
    command.append(host)
    
    try:
        output = subprocess.check_output(command, stderr=subprocess.STDOUT, universal_newlines=True)
        print(f"Command output:\n{output}")
        
        # Parse the output for latency information
        latency_info = re.findall(r'temps[=<](\d+) ms', output)
        if not latency_info:
            raise ValueError("No latency information found in ping output")
        
        latencies = list(map(int, latency_info))
        avg_latency = sum(latencies) / len(latencies)
        min_latency = min(latencies)
        max_latency = max(latencies)
        packets_sent = count
        packets_received = len(latencies)
        packets_lost = packets_sent - packets_received
        packet_loss = (packets_lost / packets_sent) * 100
        
        return {
            "packets_sent": packets_sent,
            "packets_received": packets_received,
            "packets_lost": packets_lost,
            "packet_loss": packet_loss,
            "avg_latency": avg_latency,
            "min_latency": min_latency,
            "max_latency": max_latency,
            "packet_sizes": [packet_size] * packets_received,
            "icmp_versions": [icmp_version] * packets_received
        }
    except subprocess.CalledProcessError as e:
        print(f"Command error:\n{e.output}")
        return {
            "packets_sent": count,
            "packets_received": 0,
            "packets_lost": count,
            "packet_loss": 100.0,
            "avg_latency": float('inf'),
            "min_latency": float('inf'),
            "max_latency": float('inf'),
            "packet_sizes": [packet_size] * count,
            "icmp_versions": [icmp_version] * count
        }

# Exemple d'utilisation
ping_result = ping_host("corsicalinea.ocatedra.com")
print(ping_result)
