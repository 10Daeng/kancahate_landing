// --- KNOWLEDGE BASE INITIALIZATION SCRIPT ---
// Script untuk seeding knowledge base ke Supabase
// Jalankan dengan: node --loader esm scripts/init-knowledge.js

import { initializeKnowledgeBase, getKnowledgeStats } from '../src/services/vectorService.js';

async function main() {
  console.log('🚀 Starting Knowledge Base Initialization...\n');

  try {
    // Check current stats
    console.log('📊 Current Knowledge Base Stats:');
    const stats = await getKnowledgeStats();
    console.log(`   Total entries: ${stats.total}`);
    console.log(`   By category:`, stats.byCategory);
    console.log(`   High priority: ${stats.highPriority}\n`);

    // Ask for confirmation
    if (stats.total > 0) {
      console.log('⚠️  Knowledge base already has data!');
      console.log('    Run with --force to re-initialize (will append, not overwrite)\n');
      return;
    }

    // Initialize knowledge base
    console.log('📚 Initializing Knowledge Base from rag_knowledge_base.js...');
    const result = await initializeKnowledgeBase();

    if (result.success) {
      console.log(`\n✅ Success: ${result.message}`);
      console.log(`   - ${result.result?.success || 0} entries inserted`);
      console.log(`   - ${result.result?.failed || 0} entries failed`);

      if (result.result?.errors?.length > 0) {
        console.log('\n⚠️  Errors:');
        result.result.errors.forEach(err => {
          console.log(`   - ${err.knowledge}: ${err.error}`);
        });
      }
    } else {
      console.error(`\n❌ Failed: ${result.error}`);
    }

    // Show final stats
    console.log('\n📊 Final Knowledge Base Stats:');
    const finalStats = await getKnowledgeStats();
    console.log(`   Total entries: ${finalStats.total}`);
    console.log(`   By category:`, finalStats.byCategory);
    console.log(`   High priority: ${finalStats.highPriority}\n`);

  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
