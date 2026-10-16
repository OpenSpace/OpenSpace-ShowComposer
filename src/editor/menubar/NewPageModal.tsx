import { useTranslation } from 'react-i18next';

import { PageForm } from '@/editor/menubar/PageForm';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';

interface Props {
  onClose: () => void;
}

export function NewPageModal({ onClose }: Props) {
  const { t } = useTranslation('new-page-modal');
  const addPage = useBoundStore((state) => state.addPage);

  return (
    <PageForm
      description={t('create-page-description')}
      submitLabel={t('create-page')}
      initialName={''}
      initialColor={ComponentBaseColors.page}
      onSubmit={(name, color) => addPage(undefined, name, color)}
      onClose={onClose}
    />
  );
}
