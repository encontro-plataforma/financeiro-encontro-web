/**
 * Tamanho do dialog (CsvUploadDialogComponent ou UploadResumoDialogComponent) quando
 * exibindo o <app-upload-resumo> — mantido consistente entre os dois dialogs, já que
 * mostram exatamente o mesmo conteúdo:
 * - sem erro: largo o bastante para os cards de totais caberem numa linha só, altura
 *   livre (encolhe para o tamanho do conteúdo);
 * - com erro: bem maior nos dois eixos, para caber a tabela de erros embaixo.
 */
export const UPLOAD_RESUMO_WIDTH = '680px';
export const UPLOAD_RESUMO_WIDTH_ERRO = '80vw';
export const UPLOAD_RESUMO_HEIGHT_ERRO = '90vh';
