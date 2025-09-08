// import { MantineProvider, createTheme, Button, Checkbox } from '@mantine/core';

// const theme = createTheme({
//   defaultGradient: {
//     from: 'orange',
//     to: 'red',
//     deg: 45,
//   },
// });

// function Demo() {
//   return (
//     <MantineProvider theme={theme}>
//       <Button variant="gradient">Button </Button>
//       <Checkbox label="Pointer cursor" mt="xs" />
//     </MantineProvider>
//   );
// }
// export default Demo


import { MantineProvider, createTheme, Checkbox } from '@mantine/core';

const theme = createTheme({
  cursorType: 'pointer',
});

function Demo() {
  return (
    <>
      <Checkbox label="Default cursor" />

      <MantineProvider theme={theme}>
        <Checkbox label="Pointer cursor" mt="md" />
      </MantineProvider>
    </>
  );
}
export default Demo
