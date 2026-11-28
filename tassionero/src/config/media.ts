/**
 * Imagens do site público.
 * As imagens finais serão geradas pelo Lovable (IA) e salvas em /public/images.
 * Enquanto o caminho for null, o site usa a composição gráfica própria (sem foto falsa).
 * Fotos de IA: só hero, capas de serviço e ambientes — nunca na galeria de trabalhos reais.
 */
export const media = {
  /** Foto do hero (carro escuro em estúdio com tubos de luz). Ex.: "/images/hero.webp" */
  heroImage: null as string | null,
  /** Foto de ambiente do estúdio para a seção de contato. Ex.: "/images/estudio.webp" */
  studioImage: null as string | null,
};
