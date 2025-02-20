import { getCopy } from '@/utils/copyHelpers';
import { useEffect, useState } from 'react';
import { PageComponent } from '@/store/ComponentTypes';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import Information from '@/components/common/Information';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import ToggleComponent from '@/components/common/Toggle';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/store/ComponentTypes';
import BackgroundHolder from '@/components/common/BackgroundHolder';
interface PageGUIProps {
  component: PageComponent;
  shouldRender?: boolean;
}
const PageGUIComponent: React.FC<PageGUIProps> = ({
  component,
  shouldRender = true,
}) => {
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const goToPage = useBoundStore((state) => state.goToPage);
  useEffect(() => {
    updateComponent(component.id, {
      triggerAction: () => {
        goToPage(component.page - 1);
      },
    });
  }, [component.page]);
  return shouldRender ? (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      <ButtonLabel>
        <div className="flex flex-row gap-2">
          {/* {property?.value * 100} */}
          {component.gui_name}
          <Information content={component.gui_description} />
        </div>
      </ButtonLabel>
    </ComponentContainer>
  ) : null;
};
interface PageModalProps {
  component: PageComponent | null;
  handleComponentData: (data: Partial<PageComponent>) => void;
  //   isOpen: boolean;
}
const PageModal: React.FC<PageModalProps> = ({
  component,
  handleComponentData,
  //   isOpen,
}) => {
  const pages = useBoundStore((state) => state.pages);
  const [page, setPage] = useState<number>(component?.page || 1);
  const [gui_name, setGuiName] = useState<string>(
    component?.gui_name || 'Go to Page 1',
  );
  const [lockName, setLockName] = useState<boolean>(
    component?.lockName || false,
  );
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.page,
  );

  const handlePageChange = (page: number) => {
    setPage(page);
    if (!lockName) {
      const pageData = pages[page - 1];
      setGuiName(
        `Go to ${pageData.name ? pageData.name : 'Go to Page ' + page}`,
      );
    }
  };
  useEffect(() => {
    handleComponentData({
      page,
      backgroundImage,
      gui_name,
      lockName,
      gui_description,
      color,
    });
  }, [
    page,
    backgroundImage,
    gui_name,
    lockName,
    gui_description,
    color,
    handleComponentData,
  ]);
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-4">
          <Label htmlFor="page">{getCopy('Page', 'page_number')}</Label>
          <SelectableDropdown
            options={pages.map((v, i) => ({
              value: (i + 1).toString(),
              label: v.name ? v.name : 'Page ' + (i + 1).toString(),
            }))}
            selected={page.toString()}
            setSelected={(v: string) => handlePageChange(parseInt(v))}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-3 grid gap-2">
            <Label htmlFor="gioname">{getCopy('Page', 'component_name')}</Label>
            <Input
              id="guiname"
              placeholder="Name of Component"
              type="text"
              value={gui_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGuiName(e.target.value)
              }
            />
          </div>
          <div className="cols-span-1 mt-6 grid gap-2">
            <ToggleComponent
              label="Lock Name"
              value={lockName}
              setValue={setLockName}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <BackgroundHolder
            color={color}
            setColor={setColor}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('Page', 'gui_description')}
            </Label>
            <Textarea
              className="w-full"
              id="description"
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder="Type your message here."
            />
          </div>
        </div>
      </div>
    </>
  );
};
export { PageModal, PageGUIComponent };
