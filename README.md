# 🧁 MicaBrigs — E-commerce & Confeitaria Artesanal

> Uma experiência web moderna, elegante e altamente interativa para a confeitaria artesanal MicaBrigs.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)

---

## 📌 Sobre o Projeto

O **MicaBrigs** é uma plataforma de e-commerce desenvolvida sob medida para destacar os produtos gourmet da confeitaria (brigadeiros, brownies e cestas especiais). O projeto une um **design exclusivo (Figma)** com **interações fluidas e responsivas**, oferecendo uma navegação rápida e encantadora tanto no desktop quanto no mobile.

---

## ✨ Principais Funcionalidades

- **Vitrine Dinâmica & Carrossel:** Exibição de produtos categorizados por Brigadeiros, Brownies e Cestas Especiais.
- **Microinterações com GSAP:** Efeitos de iluminação nos cards guiados pelo movimento do mouse (*Cursor-following spotlight*) e revelação suave de elementos na rolagem (*ScrollTrigger*).
- **Seleção Inteligente de Caixas:** Dropdown customizado por produto com escolha dinâmica de tamanhos (Caixas de 4, 8 ou 16 unidades).
- **Carrinho de Compras Ativo:** Gestão e cálculo de pedidos em tempo real via serviço reativo em Angular.
- **Totalmente Responsivo:** Layout desenhado em arquitetura *Mobile-First*, garantindo adaptação perfeita em smartphones, tablets e desktops.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **Angular** (Componentes Standalone, Control Flow `@for`, Signals/Services)
- **HTML5 & CSS3** (Flexbox, CSS Grid, Animações em SVG com `<textPath>`, Glassmorphism)
- **GSAP (GreenSock)** & **ScrollTrigger** (Animações de alta performance)

### **Backend**
- **Python** com **Flask**
- **SQLite** (Banco de dados relacional leve)
- **Gunicorn** (Servidor HTTP de produção)

### **DevOps & Infraestrutura**
- **Docker** (Containerização com *Multi-stage Build* para Angular + Nginx e Python/Flask)
- **Nginx** (Servidor web de alta performance para o frontend estático)
- **Render.com** (Hospedagem das imagens Docker da aplicação)

---

## 🐳 Como Rodar o Projeto com Docker

### **Pré-requisitos**
- Possuir o **Docker** e o **Docker Compose** instalados na sua máquina.

### **1. Backend (API Python)**
```bash
# Navegue até a pasta do backend
cd backend

# Construa e execute a imagem Docker
docker build -t micabrigs-api .
docker run -p 5000:5000 micabrigs-api
