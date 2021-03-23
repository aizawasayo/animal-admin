

export const globalComs = [{
    name: "Pagination",
    component: () =>
      import ('@/components/Pagination')
  },
  {
    name: "upload-single",
    component: () =>
      import ('@/components/Upload/SingleUpload')
  },
  {
    name: "upload-multi",
    component: () =>
      import ('@/components/Upload/MultiUpload')
  },
]