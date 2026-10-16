import { useTranslation } from 'react-i18next';

import { PageForm } from '@/editor/menubar/PageForm';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, type Page } from '@/types/components';

interface Props {
  onClose: () => void;
}

export function EditPageModal({ onClose }: Props) {
  const { t } = useTranslation('new-page-modal');
  const currentPage: Page = useBoundStore((state) =>
    state.getPageById(state.currentPage)
  );
  const updatePage = useBoundStore((state) => state.updatePage);

  return (
    <PageForm
      description={t('update-page-description')}
      submitLabel={t('update-page')}
      initialName={currentPage?.name || ''}
      initialColor={currentPage?.color || ComponentBaseColors.page}
      onSubmit={(name, color) => updatePage(currentPage.id, { name, color })}
      onClose={onClose}
    />
  );
}
