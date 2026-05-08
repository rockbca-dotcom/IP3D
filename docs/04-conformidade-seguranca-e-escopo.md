# 04 - Conformidade, Seguranca e Fora de Escopo

## Conformidade operacional
- Documentacao centralizada em `docs/` com historico de limpeza.
- Separacao clara entre codigo produtivo e artefatos de analise.
- Rastreabilidade de itens removidos via inventario e arquivo externo.

## Seguranca tecnica
- Acesso administrativo protegido por sessao.
- Rotas de administracao protegidas em middleware.
- Variaveis sensiveis segregadas em `.env` local (nao versionado).
- Manutencao de upload e integracoes por endpoints controlados.

## Politica de organizacao do repositorio
- Codigo-fonte e ativos produtivos ficam na raiz estruturada.
- Scripts operacionais ficam em `scripts/`.
- Scripts pontuais de manutencao ficam em `scripts/maintenance/`.
- Documentos oficiais ficam em `docs/`.
- Artefatos ad hoc devem ser arquivados fora do repositório.

## Fora de escopo desta etapa
- Refatoracoes funcionais profundas no dominio de negocio.
- Mudanca de contratos HTTP das APIs existentes.
- Redesign de UI ou mudanca de stack tecnologica.
- Ajustes de performance avancada e observabilidade expandida.

## Checklist final de conformidade
- Estrutura do app consolidada na raiz.
- Itens legados removidos do versionamento e arquivados externamente.
- Arquivos `desktop.ini` eliminados do repositorio.
- Modelo documental (01-04) ativo e referenciado no README.
- Validacoes tecnicas executadas com registro de resultado.

## Registro de arquivamento externo
- Local de arquivo historico: `C:\Users\RUI FRANCISCO\Desktop\IP3D_ARCHIVE_20260424-171940`.
