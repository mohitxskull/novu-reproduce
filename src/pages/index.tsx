import { NotificationMenuComp } from "@/components/notification-menu";
import { Center } from "@mantine/core";
import { NovuProvider } from "@novu/notification-center";

export default function Home() {
  return (
    <Center p="xl">
      <NovuProvider
        subscriberId="6583ec8ee2c54702c67d387f"
        applicationIdentifier="qu700RtKfgYT"
      >
        <NotificationMenuComp />
      </NovuProvider>
    </Center>
  );
}
