// Script simples para testar se as configurações estão no Supabase
const { createClient } = require('@supabase/supabase-js')

// Você precisa definir essas variáveis com suas credenciais reais
const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.log('❌ Por favor, configure suas credenciais do Supabase neste arquivo antes de executar o teste.')
  console.log('Edite as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no arquivo test-config.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConfiguration() {
  console.log('🔍 Testando configurações no Supabase...\n')

  try {
    // Testar conexão com Supabase
    console.log('1. Testando conexão com Supabase...')
    const { data: testConnection, error: connectionError } = await supabase
      .from('system_settings')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log('❌ Erro de conexão:', connectionError.message)
      return
    }
    console.log('✅ Conexão com Supabase OK')

    // Verificar se o sistema está marcado como configurado
    console.log('\n2. Verificando se sistema está configurado...')
    const { data: systemConfigured } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'system_configured')
      .single()
    
    if (systemConfigured) {
      console.log('✅ Sistema marcado como configurado:', systemConfigured.value)
    } else {
      console.log('⚠️ Sistema não está marcado como configurado')
    }

    // Verificar configurações de IA
    console.log('\n3. Verificando configurações de IA...')
    const { data: aiConfigs } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('is_active', true)
    
    if (aiConfigs && aiConfigs.length > 0) {
      console.log('✅ Configurações de IA encontradas:')
      aiConfigs.forEach(config => {
        console.log(`   - ${config.name} (${config.provider}): ${config.model}`)
      })
    } else {
      console.log('⚠️ Nenhuma configuração de IA encontrada')
    }

    // Verificar configurações Evolution
    console.log('\n4. Verificando configurações Evolution...')
    const evolutionSettings = ['evolution_api_url', 'evolution_api_key', 'evolution_instance_name']
    
    for (const setting of evolutionSettings) {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', setting)
        .single()
      
      if (data) {
        console.log(`✅ ${setting}: Configurado`)
      } else {
        console.log(`⚠️ ${setting}: Não configurado`)
      }
    }

    // Verificar dados de exemplo
    console.log('\n5. Verificando dados de exemplo...')
    const tables = [
      { name: 'contacts', label: 'Contatos' },
      { name: 'conversations', label: 'Conversas' },
      { name: 'knowledge_base', label: 'Base de Conhecimento' },
      { name: 'automation_rules', label: 'Regras de Automação' }
    ]

    for (const table of tables) {
      const { count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
      
      console.log(`   - ${table.label}: ${count || 0} registros`)
    }

    console.log('\n✅ Teste concluído com sucesso!')
    console.log('\n💡 Se você vê configurações aqui, o sistema deveria detectá-las automaticamente.')
    console.log('   Se ainda está vendo a tela de configuração, pode haver um problema no código de carregamento.')

  } catch (error) {
    console.log('❌ Erro durante o teste:', error.message)
  }
}

testConfiguration() 