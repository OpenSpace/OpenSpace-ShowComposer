import { FileCog } from 'lucide-react';
import { getCopy } from '@/utils/copyHelpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useComponentStore, useSettingsStore } from '@/store';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const PageButtonMenu = () => {
  const isPresentMode = useSettingsStore((state) => state.presentMode);
  const addPage = useComponentStore((state) => state.addPage);
  const deletePage = useComponentStore((state) => state.deletePage);
  const currentPage = useComponentStore((state) => state.currentPage);

  //   const updatePage = useComponentStore((state) => state.updatePage);
  const { pageWidth, pageHeight } = useSettingsStore((state) => state);
  const updatePageSize = useSettingsStore((state) => state.updatePageSize);
  const pageSizes = [
    {
      name: '1080',
      width: 1920,
      height: 1080,
    },
    {
      name: 'iPad Landscape',
      width: 1366,
      height: 1024,
    },
    {
      name: 'iPad Portrait',
      width: 1024,
      height: 1366,
    },
  ];
  //   useEffect(() => {
  //     console.log(pageHeight);
  //     console.log(pageWidth);
  //   }, [pageHeight, pageWidth]);
  //   const page: Page = useComponentStore((state) =>
  //     state.getPageById(state.currentPage),
  //   );

  //   const
  //   const [width, setWidth] = useState(1920);
  //   const [height, setHeight] = useSt ate(1080);
  return (
    <>
      {!isPresentMode && (
        <Tooltip>
          <TooltipContent>
            {getCopy('PageButtonMenu', 'page_settings')}
          </TooltipContent>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild className="z-[999999]">
                <Button
                  // className="absolute "
                  size="icon"
                  variant="outline"
                >
                  <FileCog strokeWidth="1.5" size="20" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>

            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem> */}

              {/* </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => addPage()}>
                {getCopy('PageButtonMenu', 'add_page')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deletePage(currentPage)}>
                {getCopy('PageButtonMenu', 'delete_page')}
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger side="left">
                  {/* <UserPlus className="mr-2 h-4 w-4" /> */}
                  <span>{getCopy('PageButtonMenu', 'screen_presets')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {pageSizes.map((size) => (
                      <DropdownMenuItem
                        key={size.name}
                        onClick={() => {
                          updatePageSize(size.width, size.height);
                        }}
                      >
                        <span>{size.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <div className="grid gap-2 p-2">
                <div className="space-between flex flex-row items-center gap-4">
                  <Label htmlFor="port">
                    {getCopy('PageButtonMenu', 'width')}
                  </Label>
                  <Input
                    id="width"
                    className="h-8 w-40"
                    type="number"
                    value={pageWidth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      updatePageSize(parseInt(e.target.value), pageHeight);
                    }}
                    placeholder="Enter Page Width"
                  />
                </div>
                <div className="flex flex-row  items-center gap-4">
                  <Label htmlFor="port">
                    {getCopy('PageButtonMenu', 'height')}
                  </Label>
                  <Input
                    id="height"
                    className="h-8 w-40"
                    type="number"
                    value={pageHeight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      updatePageSize(pageWidth, parseInt(e.target.value));
                    }}
                    placeholder="Enter Page Height"
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>
      )}
    </>
  );
};
export default PageButtonMenu;
