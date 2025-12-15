import React from 'react';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import { Divider } from '../components/divider';

export default function Initiatives() {
  const themes = [
    {
      title: 'Manufacturing Process Efficiency',
      subtitle: 'Grand Challenge 5',
      description: 'These challenges covered a range of issues from optimisation of production processes (e.g. furnace optimisation and chemistry variations) through to production scheduling and more general operational efficiencies (e.g. robots, cobots)',
      color: 'bg-blue-500'
    },
    {
      title: 'Decarbonising Manufacturing Inputs',
      subtitle: 'Grand Challenge 4',
      description: 'These challenges covered designing processes with new feedstocks and greater visibility of their embodied carbon.',
      color: 'bg-green-500'
    },
    {
      title: 'Enhancing Supply Chain Transparency',
      subtitle: 'Independent Theme',
      description: 'These challenges covered building a greater understanding of the supply chain and therefore where improvements could be made. This topic does not seem to be directly related to the ADViCE Grand Challenges.',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Heading>IDAIC Initiatives</Heading>
      <Text className="mt-2 text-zinc-600">
        Exploring the challenges and opportunities in industrial decarbonisation through AI and data-driven approaches.
      </Text>

      <Divider className="my-8" />

      <div className="mb-8">
        <Heading level={2} className="mb-4">Challenges by Theme</Heading>
        <Text className="mb-6">
          The challenges were grouped into themes using the ADViCE Grand Challenges (introduced in the meeting) where appropriate. 
          The top 3 most common themes identified are outlined below:
        </Text>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {themes.map((theme, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-2 h-full ${theme.color} rounded-full`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Heading level={3} className="text-xl font-semibold">
                    {index + 1}. {theme.title}
                  </Heading>
                </div>
                <div className="mb-3">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                    {theme.subtitle}
                  </span>
                </div>
                <Text className="text-zinc-600 dark:text-zinc-400">
                  {theme.description}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider className="my-8" />

      <div className="rounded-lg bg-zinc-50 p-6 dark:bg-zinc-900">
        <Heading level={3} className="mb-3">Additional Areas of Interest</Heading>
        <Text className="text-zinc-600 dark:text-zinc-400">
          There were also challenges related to using AI to support decision making and encourage more sustainable, 
          lower carbon choices of products. We intend to explore these themes further in future IDAIC sessions.
        </Text>
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start gap-3">
          <svg className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <Heading level={4} className="text-blue-900 dark:text-blue-100 mb-2">About ADViCE Grand Challenges</Heading>
            <Text className="text-blue-800 dark:text-blue-200">
              The ADViCE Grand Challenges framework provides a structured approach to identifying and addressing 
              the most critical challenges in industrial decarbonisation. These challenges represent key areas where 
              AI and data-driven solutions can have the greatest impact on reducing carbon emissions in manufacturing 
              and industrial processes.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

