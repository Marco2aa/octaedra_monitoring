from fastapi import FastAPI, Path, Query, HTTPException, status, Depends
from typing import Optional, List, Tuple
from pydantic import BaseModel,Field
import mysql.connector
from mysql.connector import Error
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
import jwt
from jwt.exceptions import PyJWTError
from datetime import datetime, timedelta, timezone
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from urllib.parse import quote
from scapy.all import IP
import re
from ping3 import ping, verbose_ping
import subprocess
import time
import platform
import socket
import ssl
import time
import subprocess
import os
import socket
import whois
import requests
import psutil


os.environ['PATH'] += r';C:\Program Files (x86)\Nmap'

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)


expo_tokens = []

class Notification(BaseModel):
    title: str
    body: str

class ExpoToken(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    password: str
    disabled: Optional[bool] = False
    email: str

class UserInDB(User):
    hashed_password: str
    email: str = Field(..., alias="email") 

class UserSignup(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Url(BaseModel):
    url: str
    nom: str
    protocole: str
    qualite_signal: str
    mode_connexion: str
    domain: bool
    verify_ssl: bool
    method: str
    ipv6:bool
    timeout:int =1
    packet_size:int = 64

class CodeHttp(BaseModel):
    num_code: int

class Port(BaseModel):
    port:int

class InfoPort(BaseModel):
    port_id:int
    service:str
    status: str
    latency:int
    updatedAt: datetime

class InfoUrl(BaseModel):
    url_id: int
    packets_sent: int
    packets_received: int
    packets_lost: int
    packets_loss: float
    avg_latency: float
    min_latency: float
    max_latency: float
    packet_sizes: int
    icmp_version: int
    ip_address: str
    ttl: int
    dns_resolution_time: float
    ssl_issuer: Optional[str] = "Unknown"
    ssl_issued_on: Optional[datetime] = None
    serial_number: Optional[str] = "Unknown"
    domain_creation_date: Optional[datetime] = None
    domain_expiration_date: Optional[datetime] = None
    server_version: Optional[str] = "Unknown"
    updatedAt: datetime
    ssl_expiration_date: datetime




def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='octaedra_servers',
            user='root',
            password=''
        )
        if connection.is_connected():
            print('Connexion à MySQL établie avec succès.')
            return connection
    except Error as e:
        print(f'Erreur lors de la connexion à MySQL : {e}')
        return None
    

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


SECRET_KEY = "3a335659ed2f3c367f811ecb6d994224160ad2890c91e4869f8cf6776d1adf35"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES= 30


@app.get('/urls')
async def get_urls():
    connection = create_connection()
    if connection:
        cursor = connection.cursor()
        select_query = "SELECT * from url"
        cursor.execute(select_query)
        urls = cursor.fetchall()
        cursor.close()
        connection.close()
        urls_json = [{"id": row[0], 
                      "url": row[1],
                      "nom": row[2],
                      "protocole": row[3],
                      "qualite_signal":row[4],
                      "mode_connexion": row[5],
                      "domain":row[6],
                      "verify_ssl": row[7],
                      "method": row[8],
                      "ipv6": row[9],
                      "packet_size": row[10]
                      } for row in urls]
        return urls_json
    else:
        return {"Error" : "Erreur de recuperation des urls depuis la base de données ."}
    

    
@app.get('/get-url/{id_url}')
async def get_url_by_id(id_url: int):
    connection = create_connection()
    if connection:
        cursor = connection.cursor()
        select_query = f"SELECT * from url where id_url={id_url}"
        cursor.execute(select_query)
        url = cursor.fetchone()
        cursor.close()
        connection.close()
        if url:
            return {"id": url[0], 
                      "url": url[1],
                      "nom": url[2],
                      "protocole": url[3],
                      "qualite_signal":url[4],
                      "mode_connexion": url[5],
                      "domain":url[6],
                      "verify_ssl": url[7],
                      "method": url[8],
                      "ipv6":url[9],
                      "packet_size": url[10]
                      }
        else:
            return {
                "Error": "L'URL avec l'ID spécifié n'existe pas."
                }
    else:
        return {
            "Error": "Erreur de récupération des données depuis la base de données."
            }
    

@app.get('/get/info-url/{url_id}')
async def get_infourl_by_id(url_id: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            select_query = "SELECT * FROM infourl WHERE url_id = %s ORDER BY id DESC LIMIT 1"
            cursor.execute(select_query,(url_id,))
            info_url = cursor.fetchone()
            print(info_url)
            if info_url:
                return {
                    "url_id": info_url[1],
                    "packets_sent": info_url[2],
                    "packets_received": info_url[3],
                    "packets_lost": info_url[4],
                    "packets_loss": info_url[5],
                    "avg_latency": info_url[6],
                    "min_latency": info_url[7],
                    "max_latency": info_url[8],
                    "packet_sizes": info_url[9],
                    "icmp_version": info_url[10],
                    "ip_address": info_url[11],
                    "ttl": info_url[12],
                    "dns_resolution_time": info_url[13],
                    "ssl_issuer": info_url[14],
                    "ssl_issued_on": info_url[15],
                    "serial_number": info_url[16],
                    "domain_creation_date":info_url[17],
                    "domain_expiration_date": info_url[18],
                    "server_version": info_url[19],
                    "updatedAt": info_url[20],  
                    "ssl_expiration_date":info_url[21]
                }
            else:
                return {"message": f"No info found for url_id {url_id}"}
        except Exception as e:
            print(f"Error: {e}")
            return {"error": str(e)}
        finally:
            cursor.close()
            connection.close()
    else:
        return {"error": "No database connection"}
    


@app.get('/get-codehttp/{id_url}')
async def get_codehttp_by_id(id_url: int):
    connection = create_connection()
    if connection:
        cursor = connection.cursor()
        select_query = """SELECT * 
                          FROM code_http
                          INNER JOIN url_code ON code_http.id_code = url_code.id_code
                          WHERE url_code.id_url = %s """
        cursor.execute(select_query,(id_url,))
        code_http = cursor.fetchone()
        cursor.close()
        connection.close()
        if code_http:
            return {
                "id":code_http[0],
                "num_code":code_http[1]
            }
        else:
            return{
                "Error": "Le code http avec l'ID spécifié n'existe pas "
            }
    else:
        return {
            "Error":"Erreur de récuperation des données depuis la base de données"
        }
    

@app.get('/get-last-250/{id_url}')
def get_last_250(id_url: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            select_query = """
                SELECT * FROM infourl
                WHERE url_id = %s
                ORDER BY id DESC
                LIMIT 250
            """
            cursor.execute(select_query, (id_url,))
            results = cursor.fetchall()
            return {"data": results}
        except Exception as e:
            print(f"Exception: {str(e)}")
            return {"error": str(e)}
        finally:
            cursor.close()
            connection.close()
    else:
        print("No database connection")
        return {"error": "No database connection"}




def scan_ports(adress_url: str) -> List[Port]:
    command = f"nmap -p- {adress_url}"

    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            open_ports = []
            info_ports = []
            for line in result.stdout.split('\n'):
                if '/tcp' in line:
                    parts = line.split()
                    if len(parts) >= 3:
                        port_number = int(parts[0].split('/')[0])
                        open_ports.append(Port(port=port_number))
            return open_ports
        else:
            print(f"Erreur lors de l'exécution de la commande nmap sur {adress_url}: {result.stderr}")
            return []

    except subprocess.TimeoutExpired:
        print(f"Nmap a pris trop de temps pour scanner : {adress_url}")
        return []

    except Exception as e:
        print(f"Erreur lors du scan de {adress_url} : {e}")
        return []
    


def check_ports_status(adress_url: str, ports: List[int]) -> List[Tuple[int, str, float, str]]:
    ports_str = ",".join(map(str, ports))
    command = f'nmap -p {ports_str} {adress_url}'

    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            port_statuses = []
            host_latency = 0.0

             
            for line in result.stdout.split('\n'):
                if "Host is up" in line:
                    parts = line.split()
                    for part in parts:
                        if part.endswith("s"):
                            print(part)
                            latency_str = ''.join(c for c in part if c.isdigit() or c == '.') 
                            print(latency_str)
                            if latency_str:  
                                if latency_str.startswith('0') and '.' not in latency_str:                         
                                    latency_str = latency_str[0] + '.' + latency_str[1:]
                                host_latency = float(latency_str) * 1000 
                                print(host_latency)
                                break


            for line in result.stdout.split('\n'):
                if '/tcp' in line:
                    parts = line.split()
                    if len(parts) >= 3:
                        port_number = int(parts[0].split('/')[0])
                        status = parts[1]
                        service = parts[2] if len(parts) > 2 else "unknown"
                        port_statuses.append((port_number, status, host_latency, service))

            return port_statuses
        else:
            print(f"Erreur lors de l'execution de la commande nmap sur {adress_url} : {result.stderr}")
            return []
    except subprocess.TimeoutExpired:
        print(f"Nmap a pris trop de temps pour vérifier : {adress_url}")
        return []

    except Exception as e:
        print(f"Erreur lors de la vérification de {adress_url} : {e}")
        return []


@app.post('/check-ports/{url_id}')
async def check_and_update_ports(url_id: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            select_query = "SELECT url FROM url WHERE id_url = %s"
            cursor.execute(select_query, (url_id,))
            url = cursor.fetchone()
            if not url:
                raise HTTPException(status_code=404, detail="URL not found")
            
            adress_url = url[0]

            cursor.execute("""
                SELECT p.port FROM port p
                JOIN serveurPort sp ON p.id_port = sp.id_port
                WHERE sp.id_url = %s
            """, (url_id,))

            ports = cursor.fetchall()
            ports_list = [port[0] for port in ports]

            if not ports_list:
                raise HTTPException(status_code=404, detail="No ports found")

            port_statuses = check_ports_status(adress_url, ports_list)

            if not port_statuses:
                raise HTTPException(status_code=500, detail="Error checking ports")
            
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            for port_number, status, latency, service in port_statuses:
                cursor.execute("SELECT id_port FROM port WHERE port = %s", (port_number,))
                port_id = cursor.fetchone()

                if port_id:
                    port_id = port_id[0]
                    cursor.execute("""
                        INSERT INTO infoPort (port_id, status, latency, service, updatedAt)
                        VALUES (%s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            status = VALUES(status),
                            latency = VALUES(latency),
                            service = VALUES(service),
                            updatedAt = VALUES(updatedAt)
                    """, (port_id, status, latency, service, current_time))

            connection.commit()
            return {"message": "Ports checked and information updated"}
        
        except mysql.connector.Error as err:
            print(f"Erreur MySQL: {err}")
            connection.rollback()
            raise HTTPException(status_code=500, detail="Database error")
        
        finally:
            cursor.close()
            connection.close()

    else:
        raise HTTPException(status_code=500, detail="Cannot connect to the database, please try again")



@app.post('/scan-ports/{url_id}')
async def scan_ports_by_url_id(url_id: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            select_query = "SELECT url FROM url WHERE id_url = %s"
            cursor.execute(select_query, (url_id,))
            url = cursor.fetchone()
            if not url:
                raise HTTPException(status_code=404, detail="URL not found")
            
            adress_url = url[0]
            open_ports = scan_ports(adress_url)

            if open_ports is None:
                raise HTTPException(status_code=500, detail="Error scanning ports")

            for port in open_ports:
                cursor.execute("SELECT id_port FROM port WHERE port = %s", (port.port,))
                port_id = cursor.fetchone()
                
                if port_id is None:
                    cursor.execute("INSERT INTO port (port) VALUES (%s)", (port.port,))
                    port_id = cursor.lastrowid
                else:
                    port_id = port_id[0]
                
                cursor.execute("INSERT INTO serveurPort (id_url, id_port) VALUES (%s, %s)", (url_id, port_id))

            connection.commit()
            return {"message": "Scan completed and ports inserted"}

        except mysql.connector.Error as err:
            print(f"Erreur MySQL: {err}")
            connection.rollback()
            raise HTTPException(status_code=500, detail="Database error")
        
        finally:
            cursor.close()
            connection.close()

    else:
        raise HTTPException(status_code=500, detail="Cannot connect to the database")


    
@app.post('/add-url')
def add_url(url: Url):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            insert_query = "INSERT into url (url, nom, protocole, qualite_signal, mode_connexion, domain, verify_ssl, method, ipv6, timeout, packet_size) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(insert_query, (
                url.url,
                url.nom,
                url.protocole, 
                url.qualite_signal, 
                url.mode_connexion,
                url.domain,
                url.verify_ssl,
                url.method,
                url.ipv6,
                url.timeout,
                url.packet_size
                ))
            connection.commit()
            url_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return {"id": url_id, "message": f"{url.url} correctement ajoutée à la base de données"}
        except Error as e:
            return HTTPException(status_code=500, detail=f"Erreur lors de l'ajout à la base de données : {e}")
    else:
        return HTTPException(status_code=500, detail="Erreur de connexion à la base de données.")
    
from fastapi import HTTPException


from datetime import datetime



def handle_inf(value):
    if value == float('inf'):
        return None  
    else:
        return value




def gather_info(host, url_id, ipv6, protocole, count=4, timeout=1, packet_size=64):
    print(f"Gathering info for host: {host}, url_id: {url_id}, ipv6: {ipv6}, protocole: {protocole}, count: {count}, timeout: {timeout}, packet_size: {packet_size}")
    
    if ipv6:
        icmp_version = 6
    else:
        icmp_version = 4

    try:
        ip_address = get_ip_address(host)
        if not ip_address:
            raise ValueError(f"Unable to resolve IP address for host: {host}")
        print(f"IP Address: {ip_address}")
    except Exception as e:
        print(f"IP address retrieval failed: {str(e)}")
        ip_address = "Unknown"
    
    try:
        ping_result = ping_host(host, count, timeout, packet_size, icmp_version)
        print(f"Ping result: {ping_result}")
    except Exception as e:
        print(f"Ping failed: {str(e)}")
        ping_result = {
            "packets_sent": 0,
            "packets_received": 0,
            "packets_lost": 0,
            "packet_loss": 100,
            "avg_latency": float('inf'),
            "min_latency": float('inf'),
            "max_latency": float('inf'),
            "packet_sizes": [0],
            "icmp_versions": [0]
        }
    
    try:
        ttl = get_ttl(host)
        print(f"TTL: {ttl}")
    except Exception as e:
        print(f"TTL retrieval failed: {str(e)}")
        ttl = -1
    
    try:
        dns_info = dns_resolution_info(host)
        print(f"DNS Info: {dns_info}")
    except Exception as e:
        print(f"DNS resolution failed: {str(e)}")
        dns_info = {"resolution_time_ms": 0}
    
    certificate_info = {}
    if protocole == "https://":
        try:
            certificate_info = get_certificate_info(host)
            print(f"Certificate Info: {certificate_info}")
        except Exception as e:
            print(f"Certificate retrieval failed: {str(e)}")
            certificate_info = {"issuer": "Unknown", "issued_on": None, "serial_number": "Unknown"}
    else:
        certificate_info = {"issuer": "Not applicable", "issued_on": None, "serial_number": "Not applicable"}
    
    try:
        domain_info = get_domain_info(host)
        print(f"Domain Info: {domain_info}")
    except Exception as e:
        print(f"Domain info retrieval failed: {str(e)}")
        domain_info = {"creation_date": None, "expiration_date": None}
    
    try:
        server_version = get_server_version(f"{protocole}{host}")
        print(f"Server Version: {server_version}")
    except Exception as e:
        print(f"Server version retrieval failed: {str(e)}")
        server_version = "Unknown"
    
    info_url = InfoUrl(
        url_id=url_id,
        packets_sent=ping_result["packets_sent"],
        packets_received=ping_result["packets_received"],
        packets_lost=ping_result["packets_lost"],
        packets_loss=ping_result["packet_loss"],
        avg_latency=ping_result["avg_latency"],
        min_latency=ping_result["min_latency"],
        max_latency=ping_result["max_latency"],
        packet_sizes=ping_result["packet_sizes"][0],
        icmp_version=ping_result["icmp_versions"][0],
        ip_address=ip_address,
        ttl=ttl,
        dns_resolution_time=dns_info["resolution_time_ms"],
        ssl_issuer=certificate_info.get("issuer", "Unknown"),
        ssl_issued_on=datetime.strptime(certificate_info["issued_on"], "%d-%m-%Y %H:%M:%S") if certificate_info.get("issued_on") else None,
        serial_number=certificate_info.get("serial_number", "Unknown"),
        domain_creation_date=datetime.strptime(domain_info["creation_date"], "%d-%m-%Y %H:%M:%S") if domain_info.get("creation_date") else None,
        domain_expiration_date=datetime.strptime(domain_info["expiration_date"], "%d-%m-%Y %H:%M:%S") if domain_info.get("expiration_date") else None,
        server_version=server_version,
        updatedAt = datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        ssl_expiration_date=datetime.strptime(certificate_info["expires_on"], "%d-%m-%Y %H:%M:%S") if certificate_info.get("expires_on") else None,
    )
    
    print(f"InfoUrl object created: {info_url}")
    return info_url





@app.post('/add-infourl/{url_id}')
def add_info_url(url_id: int):
    print(f"Endpoint '/add-infourl/{url_id}' called with url_id: {url_id}")
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()

            count_query = "SELECT COUNT(*) FROM infourl WHERE url_id = %s"
            cursor.execute(count_query,(url_id,))
            row_count = cursor.fetchone()[0]
            print(f"Number of rows in infourl: {row_count}")

            # Si le nombre de lignes est supérieur à 300, je supprime la plus ancienne
            if row_count > 300:
                delete_query = """
                DELETE FROM infourl
                WHERE id = (
                    SELECT id FROM infourl
                    ORDER BY updatedAt ASC
                    LIMIT 1
                )
                """
                cursor.execute(delete_query)
                connection.commit()
                print("Deleted the oldest entry from infourl")

            select_query = "SELECT url, timeout, ipv6, packet_size, protocole FROM url WHERE id_url = %s"
            cursor.execute(select_query, (url_id,))
            result = cursor.fetchone()
            print(f"Result from DB: {result}")

            if result:
                url = result[0]
                timeout = result[1]
                ipv6 = result[2]
                packet_size = result[3]
                protocole = result[4]

                print(f"Values retrieved from DB - URL: {url}, Timeout: {timeout}, IPv6: {ipv6}, Packet Size: {packet_size}, Protocole: {protocole}")
                
                info = gather_info(url, url_id, ipv6, protocole, 4, timeout, packet_size)
                info.avg_latency = handle_inf(info.avg_latency)
                info.min_latency = handle_inf(info.min_latency)
                info.max_latency = handle_inf(info.max_latency)
                print("coucou")
                print(f"Gathered Info: {info}")
                

                insert_query = """
                INSERT INTO infourl (
                    url_id, packets_sent, packets_received, packets_lost, packets_loss, 
                    avg_latency, min_latency, max_latency, packet_sizes, icmp_version, 
                    ip_address, ttl, dns_resolution_time, ssl_issuer, ssl_issued_on, 
                    serial_number, domain_creation_date, domain_expiration_date, server_version, updatedAt, ssl_expiration_date
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_query, (
                    info.url_id, info.packets_sent, info.packets_received, info.packets_lost, info.packets_loss,
                    info.avg_latency, info.min_latency, info.max_latency, info.packet_sizes, info.icmp_version,
                    info.ip_address, info.ttl, info.dns_resolution_time, info.ssl_issuer, info.ssl_issued_on,
                    info.serial_number, info.domain_creation_date, info.domain_expiration_date, info.server_version,info.updatedAt,info.ssl_expiration_date
                ))
                connection.commit()

                return {"message": "Data inserted successfully"}
            else:
                return {"error": f"No record found for url_id {url_id}"}
        except Exception as e:
            print(f"Exception: {str(e)}")
            return {"kikou": str(e)}
        finally:
            cursor.close()
            connection.close()
    else:
        print("No database connection")
        return {"error": "No database connection"}
    

from datetime import datetime
from fastapi import HTTPException

@app.post('/add-all-infourl')
def add_all_info_url():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()

            select_query = "SELECT id_url, url, timeout, ipv6, packet_size, protocole FROM url"
            cursor.execute(select_query)
            results = cursor.fetchall()
            if results:
                for result in results:
                    url_id = result[0]  
                    url = result[1]
                    timeout = result[2]
                    ipv6 = result[3]
                    packet_size = result[4]
                    protocol = result[5]

                    print(f"Values retrieved from DB - URL: {url}, Timeout: {timeout}, IPv6: {ipv6}, Packet Size: {packet_size}, Protocol: {protocol}, ID: {url_id}")
                    
                    info = gather_info(url, url_id, ipv6, protocol, 4, timeout, packet_size)
                    info.avg_latency = handle_inf(info.avg_latency)
                    info.min_latency = handle_inf(info.min_latency)
                    info.max_latency = handle_inf(info.max_latency)
                    
                    insert_query = """
                    INSERT INTO infourl (
                        url_id, packets_sent, packets_received, packets_lost, packets_loss, 
                        avg_latency, min_latency, max_latency, packet_sizes, icmp_version, 
                        ip_address, ttl, dns_resolution_time, ssl_issuer, ssl_issued_on, 
                        serial_number, domain_creation_date, domain_expiration_date, server_version, updatedAt,ssl_expiration_date
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)
                    """
                    cursor.execute(insert_query, (
                        info.url_id, info.packets_sent, info.packets_received, info.packets_lost, info.packets_loss,
                        info.avg_latency, info.min_latency, info.max_latency, info.packet_sizes, info.icmp_version,
                        info.ip_address, info.ttl, info.dns_resolution_time, info.ssl_issuer, info.ssl_issued_on,
                        info.serial_number, info.domain_creation_date, info.domain_expiration_date, info.server_version, info.updatedAt,info.ssl_expiration_date
                    ))
                
                connection.commit()
                return {"message": "Data inserted successfully for all URLs"}
            else:
                return {"error": "No records found in the database"}
        except Exception as e:
            print(f"Exception: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            cursor.close()
            connection.close()
    else:
        print("No database connection")
        raise HTTPException(status_code=500, detail="No database connection")

    
    

@app.post('/add-codehttp/{url_id}')
def add_code_http(codehttp: CodeHttp, url_id: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()

            select_query = "SELECT id_code FROM code_http WHERE num_code = %s"
            cursor.execute(select_query, (codehttp.num_code,))
            existing_code = cursor.fetchone()

            if existing_code:
                code_id = existing_code[0]
            else:
                insert_query = "INSERT INTO code_http (num_code) VALUES (%s)"
                cursor.execute(insert_query, (codehttp.num_code,))
                connection.commit()

                code_id = cursor.lastrowid

            insert_relation_query = "INSERT INTO url_code (id_url, id_code) VALUES (%s, %s)"
            cursor.execute(insert_relation_query, (url_id, code_id))
            connection.commit()

            cursor.close()
            connection.close()
            return {"message": "Code HTTP ajouté avec succès."}
        except Error as e:
            return HTTPException(status_code=500, detail=f"Erreur lors de l'ajout à la base de données : {e}")
    else:
        return HTTPException(status_code=500, detail="Erreur de connexion à la base de données.")
    


@app.put('/update-url/{id_url}')
def update_url(id_url: int, url: Url):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            update_query = "UPDATE url SET url=%s WHERE id_url=%s"
            cursor.execute(update_query,(url.url, id_url))
            connection.commit()
            cursor.close()
            connection.close()
            return {"message": f"URL avec l'ID {id_url} mise à jour avec succès dans la base de données."}
        except Error as e:
            return HTTPException(status_code=500, detail=f"Erreur lors de la mise à jour de l'URL dans la base de données : {e}")
    else:
        return HTTPException(status_code=500, detail="Erreur de connexion à la base de données.")
    


@app.delete('/delete-url/{id_url}')
def delete_url(id_url: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            get_ports_query = "SELECT id_port FROM serveurport WHERE id_url = %s"
            cursor.execute(get_ports_query, (id_url,))
            ports = cursor.fetchall()
            
            delete_serveurport_query = "DELETE FROM serveurport WHERE id_url = %s"
            cursor.execute(delete_serveurport_query, (id_url,))
            
            for port_id in ports:
                delete_port_query = "DELETE FROM port WHERE id_port = %s"
                cursor.execute(delete_port_query, (port_id[0],))
            
            get_code_query = "SELECT id_code FROM url_code WHERE id_url = %s"
            cursor.execute(get_code_query, (id_url,))
            codes = cursor.fetchall()
            
            delete_url_code_query = "DELETE FROM url_code WHERE id_url= %s"
            cursor.execute(delete_url_code_query, (id_url,))
            
            for code_id in codes:
                delete_code_query = "DELETE FROM code_http WHERE id_code = %s"
                cursor.execute(delete_code_query, (code_id[0],))
            
            delete_query = "DELETE FROM url WHERE id_url = %s"
            cursor.execute(delete_query, (id_url,))
            
            if cursor.rowcount == 0:
                raise Exception(f"L'URL avec l'ID {id_url} n'existe pas dans la base de données.")
            
            connection.commit()
            cursor.close()
            connection.close()
            return {"message": f"URL avec l'ID {id_url} supprimée avec succès de la base de données."}
        except Error as e:
            connection.rollback()
            return HTTPException(status_code=500, detail=f"Erreur lors de la suppression de l'URL dans la base de données : {e}")
    else:
        return HTTPException(status_code=500, detail="Erreur de connexion à la base de données.")




def check_port_latency(ip: str, port: int, timeout: float = 1.0) -> float:
    """Retourne la latence pour se connecter à un port spécifique en millisecondes, ou -1 si le port est fermé."""
    start_time = time.time()
    try:
        with socket.create_connection((ip, port), timeout=timeout):
            latency = (time.time() - start_time) * 1000  
            return latency
    except (socket.timeout, ConnectionRefusedError):
        return -1.0


    

@app.get('/ports/{id_url}')
def get_ports_by_url(id_url: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            select_query =  """ SELECT port.id_port, port.port
                                FROM port 
                                INNER JOIN serveurPort ON port.id_port = serveurPort.id_port
                                WHERE serveurPort.id_url = %s
                                """
            cursor.execute(select_query, (id_url,))
            ports = cursor.fetchall()
            port_list = []
            for port in ports:
                port = {
                    "id_port": port[0],
                    "port": (port[1].split('/')[0]),
                }
                port_list.append(port)


            cursor.close()
            connection.close()
            
            return port_list
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur lors de la recupération des ports dans la base de données: {str(e)}")
    else:
        raise HTTPException(status_code=500, detail="Erreur de connexion à la base de données")
    

@app.get('/get/info-port/{id_port}')
def get_info_port_by_id_port(id_port: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            select_query = """SELECT service, status, latency, updatedAt
                              FROM infoport
                              WHERE port_id = %s
                              ORDER BY id DESC
                              LIMIT 1"""
            cursor.execute(select_query, (id_port,))
            infoports = cursor.fetchall()
            infoport_list = []
            for infoport in infoports:
                infoport={
                    "service": infoport[0],
                    "status": infoport[1],
                    "latency": infoport[2],
                    "updatedAt": infoport[3]
                }
                infoport_list.append(infoport)
            cursor.close()
            connection.close()

            return infoport_list
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erreur lors de la récuperation des informations des ports dans la base de données: {str(e)}")
    else:
        raise HTTPException(status_code=500, detail="Erreur lors de la connexion à la base de données")
    

@app.get('/number-of-ports/{id_url}')
def get_number_of_ports_by_url(id_url: int):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            select_query = """SELECT COUNT(*)
                              FROM port 
                              INNER JOIN serveurPort ON port.id_port = serveurPort.id_port
                              WHERE serveurPort.id_url = %s"""
            cursor.execute(select_query, (id_url,))
            result = cursor.fetchone()  
            cursor.close()
            connection.close()
            number_of_ports = result[0]
            if result:
                return number_of_ports
            else:
                return {"error": "Aucun port trouvé pour cette URL"}
        except Error as e:
            return HTTPException(status_code=500, detail="Erreur lors de la récupération des ports dans la base de données")
    else:
        return HTTPException(status_code=500, detail="Erreur de connexion à la base de données")

    




def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user_from_db(username: str):
    try:
        connection = create_connection()
        cursor = connection.cursor()
        select_query = "SELECT username, password, email FROM user WHERE username = %s"
        cursor.execute(select_query, (username,))
        user_data = cursor.fetchone()
        cursor.close()
        connection.close()
        if user_data:
            user_dict = {
                "username": user_data[0],
                "password": user_data[1],  
                "hashed_password": user_data[1],
                "email": user_data[2] 
            }
            return UserInDB(**user_dict)
        else:
            return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user from database: {str(e)}")


def authenticate_user( username: str, password: str):
    user = get_user_from_db(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user( form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except PyJWTError:
        raise credentials_exception
    user = get_user_from_db(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


class UserOut(BaseModel):
    username: str


@app.post("/register", response_model=UserOut)
async def register(user: UserSignup):
    existing_user = get_user_from_db(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = pwd_context.hash(user.password)
    
    try:
        connection = create_connection()
        cursor = connection.cursor()
        insert_query = "INSERT INTO user (username, password, disabled, email) VALUES (%s, %s, %s, %s)"
        cursor.execute(insert_query, (user.username, hashed_password, False, user.email))
        connection.commit()
        cursor.close()
        connection.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register user: {str(e)}")
    
    return {"username":user.username}

from fastapi import FastAPI, HTTPException
from typing import Optional
import requests



@app.get("/code-http")
def make_http_request(protocol: str = Query(...), url: str = Query(...), code: int = Query(...)):
    full_url = f"{protocol}{url}"

    try:
        response = requests.get(full_url)
        if response.status_code == code:
            return {"status": "Success", "message": f"HTTP request successful with status code {code}"}
        else:
            raise HTTPException(status_code=response.status_code, detail="Received unexpected HTTP status code")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to make HTTP request: {str(e)}")



def ping_host(host, count=4, timeout=1, packet_size=64, icmp_version=4):
    system = platform.system()
    if system == "Windows":
        ping_option = "-n"
    elif system == "Linux":
        ping_option = "-c"
    else:
        raise Exception("Unsupported platform")
    
    command = ['ping', ping_option, str(count), '-w', str(timeout * 1000), '-l', str(packet_size)]
    
    if icmp_version == 6:
        command.append('-6')
    else:
        command.append('-4')
    command.append(host)
    print(command)
    
    try:
        output = subprocess.check_output(command, stderr=subprocess.STDOUT, universal_newlines=True)
        print(f"Command output:\n{output}")
        
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

def get_ip_address(hostname):
    try:
        ip_address = socket.gethostbyname(hostname)
        return ip_address
    except socket.gaierror:
        return None

hostname = "google.com"
ip_address = get_ip_address(hostname)
if ip_address:
    print(f"L'adresse IP de {hostname} est : {ip_address}")
else:
    print(f"Impossible de résoudre l'adresse IP pour {hostname}")



def get_ttl(hostname):
    try:
        packet = IP(dst=hostname) / " "
        ttl = packet.ttl
        return ttl
    except Exception as e:
        print(f"Erreur lors de la récupération du TTL : {e}")
        return None

hostname = "google.com"
ttl = get_ttl(hostname)
if ttl is not None:
    print(f"Le TTL vers {hostname} est : {ttl}")
else:
    print(f"Impossible de récupérer le TTL vers {hostname}")




def dns_resolution_info(hostname):
    try:
        start_time = time.time()
        ip_address = socket.gethostbyname(hostname)
        end_time = time.time()
        resolution_time = (end_time - start_time) * 1000 
        return {
            "hostname": hostname,
            "ip_address": ip_address,
            "resolution_time_ms": resolution_time
        }
    except socket.gaierror as e:
        return {
            "hostname": hostname,
            "error": str(e)
        }

hostname = "google.com"
resolution_info = dns_resolution_info(hostname)
print(f"Hostname: {resolution_info['hostname']}")
if 'ip_address' in resolution_info:
    print(f"IP Address: {resolution_info['ip_address']}")
    print(f"Resolution Time: {resolution_info['resolution_time_ms']} ms")
else:
    print(f"Error: {resolution_info['error']}")




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
hostname = "google.com"
certificate_info = get_certificate_info(hostname)

if "error" in certificate_info:
    print(f"Error fetching certificate info: {certificate_info['error']}")
else:
    print(f"Hostname: {certificate_info['hostname']}")
    print(f"Issuer: {certificate_info['issuer']}")
    print(f"Issued On: {certificate_info['issued_on']}")
    print(f"Expires On: {certificate_info['expires_on']}")
    print(f"Serial Number: {certificate_info['serial_number']}")


def get_domain_info(domain):
    try:
        domain_info = whois.whois(domain)
        creation_date = domain_info.creation_date
        expiration_date = domain_info.expiration_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        creation_date_in_french = creation_date.strftime("%d-%m-%Y %H:%M:%S")
        expiration_date_in_french = expiration_date.strftime("%d-%m-%Y %H:%M:%S")

        return {
            "domain": domain,
            "creation_date": creation_date_in_french,
            "expiration_date": expiration_date_in_french
        }
    except Exception as e:
        return {"error": str(e)}

domain = "google.com"
domain_info = get_domain_info(domain)

if "error" in domain_info:
    print(f"Error fetching domain info: {domain_info['error']}")
else:
    print(f"Domain: {domain_info['domain']}")
    print(f"Creation Date: {domain_info['creation_date']}")
    print(f"Expiration Date: {domain_info['expiration_date']}")



def get_server_version(url):
    try:
        response = requests.head(url)
        server_header = response.headers.get('Server')
        if server_header:
            return server_header
        else:
            return "Version du serveur non disponible"
    except requests.exceptions.RequestException as e:
        return f"Erreur lors de la récupération des en-têtes HTTP : {e}"
    


@app.post("/register-token")
def register_token(expoToken: ExpoToken):
    if expoToken.token not in expo_tokens:
        expo_tokens.append(expoToken.token)
    return {"message": "Token enregistré avec succès"}



def send_push_message(token, title, body):
    url = 'https://exp.host/--/api/v2/push/send'
    headers = {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
    }
    data = {
        'to': token,
        'sound': 'default',
        'title': title,
        'body': body
    }
    response = requests.post(url, headers=headers, json=data)
    print(response.json())

@app.post("/send-notification")
def send_notification(notification: Notification):
    for expo_token in expo_tokens:
        send_push_message(expo_token, notification.title, notification.body)
    return {"message": "Notifications envoyées avec succès"}

url = "https://corsicalinea.octaedra.com"
server_version = get_server_version(url)
print(f"Version du serveur web : {server_version}")






if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)