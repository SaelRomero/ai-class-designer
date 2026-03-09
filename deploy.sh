#!/bin/bash
echo "🚀 Iniciando despliegue de ai-class-designer..."

# Verificar si sudo está disponible sin contraseña o si jenkins está en el grupo docker
if groups | grep -q '\bdocker\b'; then
    echo "Usuario tiene permisos de Docker directamente."
    docker-compose down || true
    docker-compose up --build -d
else
    echo "Usando sudo para docker-compose..."
    sudo docker-compose down || true
    sudo docker-compose up --build -d
fi

# Limpieza opcional de imágenes colgadas para evitar llenar el disco
echo "🧹 Limpiando imágenes sin uso..."
sudo docker image prune -f || docker image prune -f || true

echo "✅ Despliegue finalizado exitosamente."
