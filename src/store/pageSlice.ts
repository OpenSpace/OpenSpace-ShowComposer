import { v4 as uuidv4 } from 'uuid';
import { LayoutSlice } from './layoutSlice';
import { ComponentSlice } from './componentSlice';
import { PositionSlice } from './positionSlice';
import { ComponentBase, ImmerStateCreator } from './ComponentTypes';

export type Page = {
  components: Array<ComponentBase['id']>;
  id: string;
  x: number;
  y: number;
};

export interface PageSlice {
  pages: Page[];
  currentPageIndex: number;
  currentPage: string;
  addPage: (id?: string) => void;
  addPages: (pages: Page[]) => void;
  updatePage: (id: Page['id'], data: Partial<Page>) => void;
  deletePage: (pageID: string) => void;
  goToPage: (page: number) => void;
  getPageById: (id: string) => Page;
}

export const createPageSlice: ImmerStateCreator<
  ComponentSlice & PositionSlice & PageSlice & LayoutSlice,
  PageSlice
> = (set, get) => ({
  pages: [],
  currentPageIndex: 0,
  currentPage: '',
  addPage: (id?: string) => {
    const newId = id || uuidv4();

    set((state) => {
      const newPage: Page = {
        id: newId,
        components: [],
        x: 100,
        y: 100,
      };
      state.pages.push(newPage);
      state.currentPageIndex = state.pages.length - 1;
      state.currentPage = newPage.id;
    });
  },
  addPages: (pages: Page[]) => {
    set((state) => {
      state.pages.push(...pages);
    });
  },
  updatePage: (id: Page['id'], data: Partial<Page>) => {
    set((state) => {
      const page = state.pages.find((page) => page.id === id);
      if (page) {
        Object.assign(page, data);
      }
    });
  },
  deletePage: (pageID: string) => {
    set((state) => {
      state.pages
        .find((page) => page.id === pageID)
        ?.components.forEach((compId) => {
          // state.
          delete state.components[compId];
          delete state.positions[compId];
        });
      state.pages = state.pages.filter((page) => page.id !== pageID);
      let newIndex = Math.min(
        Math.max(state.currentPageIndex, 0),
        state.pages.length - 1,
      );
      state.currentPageIndex = newIndex;
      if (state.pages.length === 0) {
        const newId = uuidv4();
        state.addPage(newId);
        newIndex = 0;
      } else {
        state.currentPage = state.pages[newIndex].id;
      }
    });
  },
  goToPage: (page: number) => {
    set((state) => {
      if (page >= 0 && page < state.pages.length) {
        console.log('goToPage', page);
        state.currentPageIndex = page;
        state.currentPage = state.pages[page].id;
      }
    });
  },
  getPageById: (id: string) => {
    const { pages } = get();
    return (
      pages.find((page) => page.id === id) || {
        id: '',
        components: [],
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        minWidth: 400,
        minHeight: 400,
      }
    );
  },
});
