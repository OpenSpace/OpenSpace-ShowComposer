import { Placeholders } from '@/components/WidgetSettings';
import { useBoundStore } from '@/store/boundStore';
import { Component, ComponentFor, ComponentType } from '@/types/components';

export interface ComponentModalChildProps<K extends ComponentType = ComponentType> {
  component: ComponentFor[K] | null;
  componentId?: Component['id'] | null;
  initialData?: Partial<ComponentFor[K]>;
  onClose: () => void;
  onCancel: () => void;
}

export function useSaveComponent() {
  const addComponent = useBoundStore((state) => state.addComponent);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const getComponentById = useBoundStore((state) => state.getComponentById);

  return function saveComponent<K extends ComponentType>(
    data: ComponentFor[K],
    placeholders?: Placeholders
  ) {
    if (!data.id) {
      return;
    }
    const final: ComponentFor[K] = placeholders
      ? {
          ...data,
          gui_name: data.gui_name || placeholders.name,
          gui_description: data.gui_description || placeholders.description
        }
      : data;
    // Update the component if it already exists, else add a new one
    if (getComponentById(data.id)) {
      updateComponent(data.id, final);
    } else {
      addComponent(final);
    }
  };
}
