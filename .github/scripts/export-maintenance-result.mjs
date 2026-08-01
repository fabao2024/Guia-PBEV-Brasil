import { collectorResultPath, emitCollectorOutput } from './maintenance-io.mjs';

const source = process.argv[2];
if (!/^[a-z][a-z0-9_-]{1,31}$/.test(source ?? '')) {
  console.error('Fonte inválida para exportação do resultado');
  process.exit(1);
}

try {
  emitCollectorOutput(collectorResultPath(source));
  console.log(`Resultado estruturado exportado: ${source}`);
} catch (error) {
  console.error(`Falha ao exportar resultado de ${source}: ${error.message}`);
  process.exit(1);
}
