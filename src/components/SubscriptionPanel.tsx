import { usePropertyStore } from '@/store'; // Adjust the import path accordingly
const SubscriptionPanel = () => {
  const topics = usePropertyStore((state) => state.topicSubscriptions);
  const subscriptions = usePropertyStore(
    (state) => state.propertySubscriptions,
  );

  // loop throught topics and usePropertySTore to get the value fo each topic
  // loop through subscriptions and usePropertyStore to get the value for each subscription
  // console.log(topics, subscriptions);

  const unsubscribeFromTopic = usePropertyStore(
    (state) => state.unsubscribeFromTopic,
  );
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty,
  );

  return (
    <div
      className="gap-0 text-black"
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        margin: '10px',
        borderRadius: '5px',
      }}
    >
      <h2 className="font-bold">Active Subscriptions</h2>
      {Object.keys(topics).length > 0 ||
      Object.keys(subscriptions).length > 0 ? (
        <ul>
          <>
            {Object.entries(topics).map(([topicName, { count }]) => (
              <li
                key={topicName}
                className="flex flex-row items-center justify-between"
              >
                <p>
                  {topicName} -{'  '}
                  <span className="text-xs font-bold">
                    Subscribers: {count}
                  </span>
                </p>
                <button
                  className="mb-2  rounded border-[1px] border-black bg-white p-2 text-black"
                  onClick={() => unsubscribeFromTopic(topicName)}
                  style={{ marginLeft: '10px' }}
                >
                  Unsubscribe
                </button>
              </li>
            ))}
            {Object.entries(subscriptions).map(([topicName, { count }]) => (
              <li
                key={topicName}
                className="flex flex-row items-center justify-between"
              >
                <p>
                  {topicName} -{'  '}
                  <span className="text-xs font-bold">
                    Subscribers: {count}
                  </span>{' '}
                </p>
                <button
                  className="mb-2  rounded border-[1px] border-black bg-white p-2 text-black"
                  onClick={() => unsubscribeFromProperty(topicName)}
                  style={{ marginLeft: '10px' }}
                >
                  Unsubscribe
                </button>
              </li>
            ))}
          </>
        </ul>
      ) : (
        <p>No active subscriptions.</p>
      )}
    </div>
  );
};

export default SubscriptionPanel;
