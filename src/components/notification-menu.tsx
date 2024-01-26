import {
  ActionIcon,
  Box,
  Checkbox,
  Divider,
  Grid,
  Group,
  Indicator,
  Paper,
  Popover,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useClickOutside, useListState } from "@mantine/hooks";
import { useNotifications, useNovuContext } from "@novu/notification-center";
import {
  IconInbox,
  IconMailOpened,
  IconSelect,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Children, useEffect, useLayoutEffect, useState } from "react";

export const NotificationMenuComp = () => {
  // TODO: implement pagination
  const {
    // fetchNextPage,
    // hasNextPage,
    // refetch,
    unreadCount,
    unseenCount,
    isFetching,
    isLoading,
    markNotificationAsRead,
    markNotificationAsSeen,
    notifications,
    removeMessage,
    removeAllMessages,
    markFetchedNotificationsAsRead,
    markFetchedNotificationsAsSeen,
  } = useNotifications();

  const { isSessionInitialized, setFetchingStrategy } = useNovuContext();

  const router = useRouter();

  const [MenuOpen, setMenuOpen] = useState(false);

  const ref = useClickOutside(() => setMenuOpen(false));

  const [SelectMode, setSelectMode] = useState(false);

  const [Selected, SelectedHandler] = useListState<string>([]);

  const HandleReadBtn = () => {
    if (SelectMode) {
      const NotRead = notifications?.filter(
        (notification) =>
          notification.read === false && Selected.includes(notification._id)
      );

      if (NotRead) {
        NotRead.forEach((notification) => {
          void markNotificationAsRead(notification._id);
          void markNotificationAsSeen(notification._id);
        });
      }

      SelectedHandler.setState([]);

      setSelectMode(false);
    } else {
      void markFetchedNotificationsAsRead();
      void markFetchedNotificationsAsSeen();
    }
  };

  const HandleDeleteBtn = () => {
    if (SelectMode) {
      Selected.forEach((id) => {
        void removeMessage(id);
      });

      SelectedHandler.setState([]);

      setSelectMode(false);
    } else {
      void removeAllMessages();
    }
  };

  useEffect(() => {
    setFetchingStrategy({ fetchNotifications: true });
  }, [setFetchingStrategy]);

  return (
    <>
      <Popover position="bottom-end" shadow="md" opened={MenuOpen} width={300}>
        <Popover.Target>
          <Indicator
            inline
            label={unreadCount}
            size={16}
            disabled={unreadCount === 0 || MenuOpen}
          >
            <ActionIcon
              variant="light"
              size="38px"
              loading={isFetching || !isSessionInitialized || isLoading}
              loaderProps={{ size: 16 }}
              onClick={() => {
                if (!isSessionInitialized) {
                  return;
                }

                setMenuOpen(!MenuOpen);
              }}
            >
              <IconInbox size={16} />
            </ActionIcon>
          </Indicator>
        </Popover.Target>

        <Popover.Dropdown p="xs" ref={ref}>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text fw="bold" c="light" size="sm">
                {unreadCount} unread
              </Text>

              <Group>
                <Tooltip
                  label={SelectMode ? "Delete selected" : "Delete all"}
                  position="left"
                >
                  <ActionIcon
                    onClick={HandleDeleteBtn}
                    size="md"
                    variant="light"
                    disabled={
                      SelectMode
                        ? Selected.length === 0
                        : notifications?.length === 0
                    }
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip
                  label={
                    SelectMode ? "Mark selected as read" : "Mark all as read"
                  }
                  position="left"
                >
                  <ActionIcon
                    onClick={HandleReadBtn}
                    size="md"
                    variant="light"
                    disabled={
                      SelectMode
                        ? Selected.length === 0
                        : notifications?.length === 0 || unreadCount === 0
                    }
                  >
                    <IconMailOpened size={18} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Select" position="left">
                  <ActionIcon
                    disabled={notifications?.length === 0}
                    size="md"
                    variant="light"
                    onClick={() => {
                      if (SelectMode) {
                        setSelectMode(false);
                        SelectedHandler.setState([]);
                      } else {
                        setSelectMode(true);
                      }
                    }}
                  >
                    <IconSelect size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            <Divider />

            <ScrollArea h={320} type="never">
              <Stack gap={5}>
                {isSessionInitialized &&
                  (notifications && notifications.length > 0 ? (
                    Children.toArray(
                      notifications.map((notification) => (
                        <Paper
                          onClick={() => {
                            if (SelectMode) {
                              return;
                            }

                            if (notification.read === false) {
                              void markNotificationAsRead(notification._id);
                            }

                            if (notification.seen === false) {
                              void markNotificationAsSeen(notification._id);
                            }

                            if (
                              notification.payload.link as string | undefined
                            ) {
                              void router.push(
                                notification.payload.link as string
                              );
                            }
                          }}
                          bg="transparent"
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          <Grid gutter="xs">
                            {SelectMode && (
                              <Grid.Col span="content">
                                <Checkbox
                                  size="xs"
                                  my="auto"
                                  checked={Selected.includes(notification._id)}
                                  onChange={(event) => {
                                    if (event.currentTarget.checked) {
                                      SelectedHandler.append(notification._id);
                                    } else {
                                      const index = Selected.indexOf(
                                        notification._id
                                      );

                                      if (index > -1) {
                                        SelectedHandler.remove(index);
                                      }
                                    }
                                  }}
                                />
                              </Grid.Col>
                            )}
                            <Grid.Col span="auto">
                              <Stack gap={0}>
                                <Group justify="space-between">
                                  <Text c="dimmed" size="xs" fw="bold">
                                    {new Date(
                                      notification.createdAt
                                    ).toISOString()}
                                  </Text>

                                  {!notification.read && (
                                    <Box
                                      h="5px"
                                      w="5px"
                                      bg="red"
                                      style={{
                                        // round
                                        borderRadius: "50%",
                                      }}
                                      my="auto"
                                    />
                                  )}
                                </Group>

                                <Title order={6} lh="13px" mt="5px">
                                  {(notification.payload.title as string) ??
                                    "Error"}
                                </Title>

                                <Text size="sm">
                                  {(notification.payload.body as string) ??
                                    "Error"}
                                </Text>

                                {(notification.payload.note as
                                  | string
                                  | undefined) && (
                                  <>
                                    <Text c="dimmed" size="sm">
                                      {notification.payload.note as string}
                                    </Text>
                                  </>
                                )}
                              </Stack>
                            </Grid.Col>
                          </Grid>
                        </Paper>
                      ))
                    )
                  ) : (
                    <>
                      <Text size="sm" c="gray.0">
                        No notifications yet. We will notify you when something
                        new happens.
                      </Text>
                    </>
                  ))}
              </Stack>
            </ScrollArea>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </>
  );
};
