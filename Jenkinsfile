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
            sh """
                curl -s -X POST "https://api.telegram.org/bot7932825981:AAF_6nQ2th9ooxCrGkmiAlw_TnGNajn4tSU/sendMessage" \
                    -H "Content-Type: application/json" \
                    -d "{\"chat_id\": \"8669443470\", \"text\": \"✅ \${JOB_NAME} #\${BUILD_NUMBER} completado\\n🔗 \${BUILD_URL}\"}"
            """
        }
        failure {
            sh """
                curl -s -X POST "https://api.telegram.org/bot7932825981:AAF_6nQ2th9ooxCrGkmiAlw_TnGNajn4tSU/sendMessage" \
                    -H "Content-Type: application/json" \
                    -d "{\"chat_id\": \"8669443470\", \"text\": \"❌ \${JOB_NAME} #\${BUILD_NUMBER} falló\\n🔗 \${BUILD_URL}console\"}"
            """
        }
    }
}
