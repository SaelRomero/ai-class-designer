pipeline {
    agent any
    
    stages {
        stage('Preparar Entorno') {
            steps {
                echo 'Iniciando pipeline de despliegue para ai-class-designer...'
                sh 'chmod +x deploy.sh'
            }
        }
        
        stage('Construir y Desplegar (Producción)') {
            steps {
                echo 'Ejecutando script de despliegue...'
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            echo '✅ La aplicación se ha desplegado correctamente en producción.'
        }
        failure {
            echo '❌ Ocurrió un error al intentar desplegar. Revisa los logs de Jenkins.'
        }
    }
}
