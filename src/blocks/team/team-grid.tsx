'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
}

interface TeamGridProps {
  members?: TeamMember[];
}

const defaultMembers: TeamMember[] = [
  {
    name: 'Arjun Sharma',
    role: 'Founder & CEO',
    bio: 'Building products for developers',
  },
  {
    name: 'Priya Patel',
    role: 'Head of Engineering',
    bio: 'Full-stack developer and tech lead',
  },
  {
    name: 'Rahul Kumar',
    role: 'Product Designer',
    bio: 'Creating beautiful user experiences',
  },
];

export function TeamGrid({ members = defaultMembers }: TeamGridProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Meet our team
          </h2>
          <p className="text-lg text-muted-foreground">
            The people building the future
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {members.map((member, index) => (
            <Card key={index}>
              <CardContent className="pt-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-2xl">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                {member.bio && (
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
