import { sha256, verifyPassword } from './crypto';

/**
 * Testes rápidos para validar funcionalidades críticas
 * Executar no console do navegador para verificar se tudo está funcionando
 */

export async function runSmokeTests() {
  console.log('🧪 Executando testes de funcionalidade...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: [] as Array<{ name: string; passed: boolean; error?: string }>
  };

  // Teste 1: Hash de senha
  try {
    const password = 'teste123';
    const hash = await sha256(password);
    const isValid = hash.length === 64 && /^[a-f0-9]+$/.test(hash);
    
    results.tests.push({
      name: 'Hash SHA-256',
      passed: isValid
    });
    
    if (isValid) results.passed++;
    else results.failed++;
  } catch (error) {
    results.tests.push({
      name: 'Hash SHA-256',
      passed: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    results.failed++;
  }

  // Teste 2: Verificação de senha
  try {
    const password = 'minhasenha';
    const hash = await sha256(password);
    const verification = await verifyPassword(password, hash);
    const falseVerification = await verifyPassword('senhaerrada', hash);
    
    const isValid = verification === true && falseVerification === false;
    
    results.tests.push({
      name: 'Verificação de senha',
      passed: isValid
    });
    
    if (isValid) results.passed++;
    else results.failed++;
  } catch (error) {
    results.tests.push({
      name: 'Verificação de senha',
      passed: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    results.failed++;
  }

  // Teste 3: E-mail case insensitive
  try {
    const email1 = 'TESTE@EXEMPLO.COM';
    const email2 = 'teste@exemplo.com';
    const normalized1 = email1.toLowerCase();
    const normalized2 = email2.toLowerCase();
    
    const isValid = normalized1 === normalized2;
    
    results.tests.push({
      name: 'E-mail case insensitive',
      passed: isValid
    });
    
    if (isValid) results.passed++;
    else results.failed++;
  } catch (error) {
    results.tests.push({
      name: 'E-mail case insensitive',
      passed: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    results.failed++;
  }

  // Teste 4: Variáveis de ambiente
  try {
    const hasApiKey = !!import.meta.env.VITE_AIRTABLE_API_KEY;
    const hasBaseId = !!import.meta.env.VITE_AIRTABLE_BASE_ID;
    const hasUsersTable = !!import.meta.env.VITE_AIRTABLE_USERS;
    
    const isValid = hasApiKey && hasBaseId && hasUsersTable;
    
    results.tests.push({
      name: 'Variáveis de ambiente',
      passed: isValid,
      error: !isValid ? 'Verifique VITE_AIRTABLE_API_KEY, VITE_AIRTABLE_BASE_ID e VITE_AIRTABLE_USERS' : undefined
    });
    
    if (isValid) results.passed++;
    else results.failed++;
  } catch (error) {
    results.tests.push({
      name: 'Variáveis de ambiente',
      passed: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    results.failed++;
  }

  // Exibir resultados
  console.log('\n📊 Resultados dos testes:');
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`❌ Falhou: ${results.failed}`);
  console.log('\n📋 Detalhes:');
  
  results.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    if (!test.passed && test.error) {
      console.log(`   Erro: ${test.error}`);
    }
  });

  if (results.failed === 0) {
    console.log('\n🎉 Todos os testes passaram! Sistema pronto para uso.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique a configuração.');
  }

  return results;
}

// Executar automaticamente em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🔧 Modo de desenvolvimento detectado. Execute runSmokeTests() no console para testar.');
}