import { useComponentStore } from '@/store';
import { getCopy } from '@/utils/copyHelpers';
import { useEffect, useState } from 'react';
import { PageComponent } from '@/store/componentsStore';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import Information from '@/components/common/Information';
import ImageUpload from '@/components/common/ImageUpload';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import ToggleComponent from '@/components/common/Toggle';

interface PageGUIProps {
  component: PageComponent;
  shouldRender?: boolean;
}
const PageGUIComponent: React.FC<PageGUIProps> = ({
  component,
  shouldRender = true,
}) => {
  const updateComponent = useComponentStore((state) => state.updateComponent);
  const goToPage = useComponentStore((state) => state.goToPage);
  useEffect(() => {
    // console.log('Registering trigger action');
    updateComponent(component.id, {
      triggerAction: () => {
        goToPage(component.page - 1);
      },
    });
  }, [component.page]);
  return shouldRender ? (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
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
  const pages = useComponentStore((state) => state.pages);
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
  const [lastPage, setLastPage] = useState<number>(component?.page || 1);

  useEffect(() => {
    if (page !== lastPage && !lockName) {
      if (page) {
        setGuiName(`Go to Page ${page}`);
        setLastPage(page);
      }
    }
    handleComponentData({
      page,
      backgroundImage,
      gui_name,
      lockName,
      gui_description,
    });
  }, [
    page,
    backgroundImage,
    gui_name,
    lockName,
    gui_description,
    handleComponentData,
  ]);
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-4">
          <Label htmlFor="page">{getCopy('Page', 'page_number')}</Label>
          <SelectableDropdown
            options={pages.map((_v, i) => (i + 1).toString())}
            selected={page.toString()}
            setSelected={(v: string) => setPage(parseInt(v))}
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
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('Page', 'background_image')}
            </Label>
            <ImageUpload
              value={backgroundImage}
              onChange={(v) => setBackgroundImage(v)}
            />
          </div>
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
